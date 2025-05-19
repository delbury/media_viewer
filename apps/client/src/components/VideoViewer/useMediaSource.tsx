import { useDebounce } from '#/hooks/useDebounce';
import { useSwrMutation } from '#/hooks/useSwr';
import { fetchData } from '#/request';
import { getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { logError } from '#pkgs/tools/common';
import { isNil } from 'lodash-es';
import {
  DOMAttributes,
  ReactEventHandler,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  calcVideoSegmentParams,
  CAN_DIRECT_PLAY_EXTS,
  FILE_CODECS,
  hitCacheRange,
  stopStream,
  VIDEO_ENDED_THRESHOLD,
  VIDEO_LAZY_LOAD_THRESHOLD,
  waitUpdateend,
} from './util';

interface UseMediaSourceParams {
  mediaRef: RefObject<HTMLMediaElement | null>;
  file?: FileInfo;
  forceSource?: boolean;
}

type SrcType = 'raw' | 'source' | null;

export const useMediaSource = ({ mediaRef, file, forceSource }: UseMediaSourceParams) => {
  // 当前视频分片请求的 offset
  const currentSegmentOffset = useRef(0);
  // 视频总时长
  const videoDuration = useRef<number>(void 0);
  // 停止请求
  const abortController = useRef<AbortController>(null);
  // source buffer
  const sourceBuffer = useRef<SourceBuffer>(null);
  // media source
  const mediaSource = useRef<MediaSource>(null);
  // 资源已经加载到结尾
  const isLoadDone = useRef(false);
  // 正在加载中
  const [isLoading, setIsLoading] = useState(false);
  // 真正的可以播放，完成降级处理后
  const [isCanplay, setIsCanplay] = useState(false);
  // 视频资源的类型
  const [srcType, setSrcType] = useState<SrcType>(null);
  const isSource = srcType === 'source';
  const isRaw = srcType === 'raw';

  // 视频报错事件
  const handleError = useCallback<ReactEventHandler<HTMLVideoElement>>(
    ev => {
      const err = (ev.target as HTMLVideoElement).error;
      // 判断错误类型，如果是浏览器不支持播放的视频，则降级为服务端转码
      if (
        err &&
        isRaw &&
        (err.code === err.MEDIA_ERR_DECODE || err.code === err.MEDIA_ERR_SRC_NOT_SUPPORTED)
      ) {
        setSrcType('source');
      } else {
        logError(err);
      }
    },
    [isRaw]
  );

  // 视频可播放事件，防止只有音频可以播放，视频无法播放
  const handleCanplay = useCallback<ReactEventHandler<HTMLVideoElement>>(ev => {
    const target = ev.target as HTMLVideoElement;

    if (!target.videoHeight && !target.videoWidth) {
      setSrcType('source');
    } else {
      setIsCanplay(true);
    }
  }, []);

  // 请求视频元信息
  const metadataRequest = useSwrMutation('videoMetadata', {
    params: {
      basePathIndex: file?.basePathIndex?.toString() as string,
      relativePath: file?.relativePath as string,
    },
  });

  // 动态懒加载视频分片
  const lazyLoadSegment = useCallback(
    async (force: boolean = false) => {
      // 正在请求或者已经完成，直接返回
      if ((isLoading && !force) || isLoadDone.current || !file) return;

      const buffer = sourceBuffer.current;
      const source = mediaSource.current;
      if (!buffer || !source) return;

      const totalDuration = videoDuration.current;
      const controller = new AbortController();
      abortController.current = controller;

      if (isNil(totalDuration)) throw new Error('video duration error');

      // 请求资源
      const { current, duration, next, done } = calcVideoSegmentParams(
        currentSegmentOffset.current,
        totalDuration
      );

      // 无效分片
      if (!duration) return;

      try {
        // 是否已经加载完所有分片
        isLoadDone.current = done;
        // 计算下一分片的起始时间
        currentSegmentOffset.current = next;
        // 开始加载
        setIsLoading(true);

        const [error, response] = await fetchData('videoSegment', {
          params: {
            basePathIndex: file.basePathIndex?.toString() as string,
            relativePath: file.relativePath,
            start: current.toString(),
            duration: duration.toString(),
          },
          signal: controller.signal,
        });

        if (!response || error) {
          // 有错误
          setIsLoading(false);
          return;
        }

        abortController.current = null;
        controller.signal.onabort = () => {
          // 中断 fetch 请求后，结束流
          stopStream(source, buffer);
          abortController.current = null;
          setIsLoading(false);
        };

        // 读取数据
        const data = await response.arrayBuffer();
        await waitUpdateend(buffer);
        if (Array.from(source.sourceBuffers).includes(buffer)) {
          // 监听当次分片请求完毕
          buffer.addEventListener(
            'updateend',
            async () => {
              if (done && source.readyState === 'open') stopStream(source, buffer);
            },
            { once: true }
          );

          buffer.timestampOffset = current;
          buffer.appendBuffer(data);
        }
      } catch {
        // 流中断后，直接中断 fetch 请求
        controller.abort('error');
      } finally {
        // 加载结束
        setIsLoading(false);
      }
    },
    [file, isLoading, mediaRef]
  );
  const lazyLoadSegmentDebounce = useDebounce(lazyLoadSegment, 200);

  // 创建 media source
  const createSource = useCallback(() => {
    const elm = mediaRef.current;
    if (elm) {
      const source = new MediaSource();
      mediaSource.current = source;
      const url = URL.createObjectURL(source);
      // 绑定源
      elm.src = url;

      // 开始事件
      source.addEventListener(
        'sourceopen',
        async () => {
          // 获取视频的总长度
          const metadataInfo = await metadataRequest.trigger();
          const totalDuration = metadataInfo?.data?.duration;
          videoDuration.current = totalDuration;

          // 创建并添加 buffer
          const buffer = source.addSourceBuffer(FILE_CODECS);
          sourceBuffer.current = buffer;

          // 设置播放窗口
          if (!isNil(totalDuration)) {
            buffer.appendWindowStart = 0;
            buffer.appendWindowEnd = totalDuration;
          }

          // 手动设置时长，只触发一次
          buffer.addEventListener(
            'updateend',
            () => {
              if (source.readyState === 'open') source.duration = totalDuration ?? NaN;
            },
            { once: true }
          );

          await lazyLoadSegmentDebounce();
        },
        { once: true }
      );

      return { url };
    }
  }, [lazyLoadSegmentDebounce, mediaRef, metadataRequest]);

  // 播放时间改变
  const handleTimeUpdate = useCallback<ReactEventHandler<HTMLVideoElement>>(
    ev => {
      const buffer = sourceBuffer.current;
      const source = mediaSource.current;
      if (!isSource || !buffer || !source) return;

      const currentTime = (ev.target as HTMLMediaElement).currentTime;

      const cacheRange = hitCacheRange(buffer.buffered, currentTime);
      // 未加载完成，且播放到当前缓存区间剩余时间不足时，继续加载分片
      // 命中缓存时才自动加载，否则跳过
      if (cacheRange && cacheRange[1] - currentTime < VIDEO_LAZY_LOAD_THRESHOLD) {
        lazyLoadSegmentDebounce();
      }
    },
    [isSource, lazyLoadSegmentDebounce]
  );

  // 拖动进度条事件
  const handleSeeking = useCallback<ReactEventHandler<HTMLVideoElement>>(
    ev => {
      const elm = mediaRef.current;
      const buffer = sourceBuffer.current;
      if (!isSource || !buffer || !elm) return;

      const currentTime = (ev.target as HTMLMediaElement).currentTime;

      // 查询缓存
      const cacheRange = hitCacheRange(buffer.buffered, currentTime);

      // 命中缓存
      if (cacheRange) {
        // 设置加载缓存的开始时间
        currentSegmentOffset.current = cacheRange[1];

        // 清除其他分段缓存
        // buffer.remove(cacheRange[1], Infinity);

        // 判断当前命中的缓存未加载到视频结束
        if (
          Math.abs(cacheRange[1] - (mediaSource.current?.duration ?? 0)) > VIDEO_ENDED_THRESHOLD
        ) {
          isLoadDone.current = false;
        }
        // 跳过
        return;
      }

      // 停止旧的请求
      abortController.current?.abort('stopOld');

      // 没有命中缓存，重置加载结束 flag
      isLoadDone.current = false;
      // 从当前进度开始，请求缓存数据
      currentSegmentOffset.current = currentTime;

      lazyLoadSegmentDebounce(true);
    },
    [isSource, lazyLoadSegmentDebounce, mediaRef]
  );

  // 播放结束事件
  const handleEnded = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    if (!isSource) return;
  }, [isSource]);

  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm || !file) return;

    let type: SrcType = 'source';
    if (!forceSource && file && CAN_DIRECT_PLAY_EXTS.includes(file.nameExtPure)) {
      type = 'raw';
    }
    setSrcType(type);

    if (type === 'source') {
      const res = createSource();

      return () => {
        stopStream(mediaSource.current, sourceBuffer.current);
        abortController.current?.abort('streamEnd');
        videoDuration.current = 0;
        currentSegmentOffset.current = 0;
        sourceBuffer.current = null;
        mediaSource.current = null;
        isLoadDone.current = false;
        if (res?.url) URL.revokeObjectURL(res?.url);
      };
    } else if (type === 'raw') {
      elm.src = getFileSourceUrl(file);
    }
  }, [file, forceSource]);

  return {
    isCanplay,
    isLoading,
    // 默认判断就是为 source 类型的资源
    isRawSource: !forceSource && isSource,
    // 是否是手动转换为 source 类型
    isForced: !!forceSource,
    events: {
      onTimeUpdate: handleTimeUpdate,
      onEnded: handleEnded,
      onSeeking: handleSeeking,
      onError: handleError,
      onCanPlay: handleCanplay,
    } satisfies Pick<
      DOMAttributes<HTMLVideoElement>,
      'onSeeking' | 'onError' | 'onTimeUpdate' | 'onEnded' | 'onCanPlay'
    >,
  };
};
