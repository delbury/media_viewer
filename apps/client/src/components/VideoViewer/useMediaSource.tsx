import { useSwr } from '#/hooks/useSwr';
import { fetchArrayBufferData } from '#/request';
import { getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import Big from 'big.js';
import { isNil } from 'lodash-es';
import { DOMAttributes, ReactEventHandler, RefObject, useCallback, useEffect, useRef } from 'react';

interface UseMediaSourceParams {
  mediaRef: RefObject<HTMLMediaElement | null>;
  file: FileInfo;
  // 启用
  enabled: boolean;
}

// 视频编码
const FILE_CODECS = 'video/mp4; codecs="avc1.640028, mp4a.40.2"';

// 视频分片的长度，单位 s
const VIDEO_SEGMENT_DURATION = 5;

// 继续加载视频分片的最小剩余时间
const VIDEO_LAZY_LOAD_THRESHOLD = VIDEO_SEGMENT_DURATION / 2;

// 视频最后不满分片长度的最小百分比
// 如果最后一个分片的长度小于 VIDEO_LAST_DURATION_MIN_THRESHOLD，
// 则最后一个分片与上一个完整的分片合并，否则则作为单独的一个分片
const VIDEO_LAST_SEGMENT_THRESHOLD = Big(0.5).mul(VIDEO_SEGMENT_DURATION);

/**
 * 阈值：VIDEO_LAST_DURATION_MIN_THRESHOLD
 *
 * 场景1：当前段结束时间大于等于总长，则取 total
 *   total   ==========----------=====|
 *   next    ==========----------==========|
 *   real    ..............................|
 *
 * 场景2：当前段结束时间小于总长，且相差部分小于等于阈值，则取 total
 *   total   ==========----------=====|
 *   next    ==========----------|
 *   real    .........................|
 *
 * 场景3：当前段结束时间小于总长，且相差部分大于阈值，则取 next
 *   total   ==========----------=====|
 *   next    ==========|
 *   real    ..........|
 */
const calcVideoSegmentParams = (currentTime: number, fullDuration: number) => {
  // 已结束
  let done = false;
  const nextBig = Big(currentTime).add(VIDEO_SEGMENT_DURATION);
  const fullBig = Big(fullDuration);
  let nextTime: number = 0;
  let durationTime = 0;

  if (nextBig.lt(fullBig) && fullBig.minus(nextBig).gt(VIDEO_LAST_SEGMENT_THRESHOLD)) {
    nextTime = nextBig.toNumber();
    durationTime = VIDEO_SEGMENT_DURATION;
  } else {
    done = true;
    nextTime = fullDuration;
    durationTime = fullBig.minus(currentTime).toNumber();
  }

  return {
    done,
    current: currentTime,
    duration: durationTime,
    next: nextTime,
  };
};

const stopStream = (source: MediaSource, buffer: SourceBuffer | null) => {
  if (buffer?.updating) buffer?.abort();
  if (source.readyState === 'open') source.endOfStream();
};

// updateend 有时候 buffer.updating 仍为 true
// 可能是 bug，先用递归判断的方式兜底
const waitUpdateend = async (buffer: SourceBuffer) => {
  if (buffer.updating) {
    await new Promise(resolve => buffer.addEventListener('updateend', resolve, { once: true }));
    if (buffer.updating) await waitUpdateend(buffer);
  }
};

// hook
export const useMediaSource = ({ mediaRef, file, enabled }: UseMediaSourceParams) => {
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
  const isLoading = useRef(false);

  // 请求视频分段数据接口
  const metadataRequest = useSwr('fileVideoMetadata', {
    params: {
      basePathIndex: file.basePathIndex.toString(),
      relativePath: file.relativePath,
    },
    lazy: true,
    disabled: !enabled,
    noticeWhenSuccess: false,
  });

  // 动态懒加载视频分片
  const lazyLoadSegment = useCallback(async () => {
    // 正在请求或者已经完成，直接返回
    if (isLoading.current || isLoadDone.current) return;

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

    try {
      // 是否已经加载完所有分片
      isLoadDone.current = done;
      // 计算下一分片的起始时间
      currentSegmentOffset.current = next;
      // 开始加载
      isLoading.current = true;

      const response = await fetchArrayBufferData('fileVideoSegment', {
        params: {
          basePathIndex: file.basePathIndex.toString(),
          relativePath: file.relativePath,
          start: current.toString(),
          duration: duration.toString(),
        },
        signal: controller.signal,
      });
      controller.signal.onabort = () => {
        // 中断 fetch 请求后，结束流
        stopStream(source, buffer);
      };

      // 读取数据
      const data = await response.arrayBuffer();
      await waitUpdateend(buffer);
      if (Array.from(source.sourceBuffers).includes(buffer)) {
        buffer.timestampOffset = current;
        buffer.appendBuffer(data);
      }
    } catch {
      // 流中断后，直接中断 fetch 请求
      controller.abort();
      abortController.current = null;
    } finally {
      // 加载结束
      isLoading.current = false;
    }
  }, [file.basePathIndex, file.relativePath]);

  // 创建 media source
  const createSource = useCallback(() => {
    const elm = mediaRef.current;
    if (elm) {
      const source = new MediaSource();
      mediaSource.current = source;
      const src = URL.createObjectURL(source);
      // 绑定源
      elm.src = src;

      // 开始事件
      source.addEventListener(
        'sourceopen',
        async () => {
          // 获取视频的总长度
          const metadataInfo = await metadataRequest.mutate();
          const totalDuration = metadataInfo?.data?.duration;
          videoDuration.current = totalDuration;

          // 创建并添加 buffer
          const buffer = source.addSourceBuffer(FILE_CODECS);
          sourceBuffer.current = buffer;

          buffer.addEventListener(
            'updateend',
            async () => {
              // 手动设置时长
              source.duration = totalDuration ?? NaN;
            },
            { once: true }
          );

          buffer.addEventListener('updateend', async () => {
            // 结束流
            if (isLoadDone.current) stopStream(source, buffer);
          });

          await lazyLoadSegment();
        },
        { once: true }
      );

      return () => {
        stopStream(source, sourceBuffer.current);
        abortController.current?.abort();
      };
    }
  }, [lazyLoadSegment, mediaRef, metadataRequest]);

  // 进度条拖动
  const handleSeeked = useCallback<ReactEventHandler<HTMLVideoElement>>(
    ev => {
      if (!enabled) return;

      // console.log(ev);
    },
    [enabled]
  );

  // 播放时间改变
  const handleTimeUpdate = useCallback<ReactEventHandler<HTMLVideoElement>>(
    ev => {
      if (!enabled) return;

      const currentTime = (ev.target as HTMLMediaElement).currentTime;

      // 未加载完成，且播放到剩余时间不足时，继续加载分片
      if (currentSegmentOffset.current - currentTime < VIDEO_LAZY_LOAD_THRESHOLD) {
        lazyLoadSegment();
      }
    },
    [lazyLoadSegment, enabled]
  );

  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;

    let cb: (() => void) | undefined;

    if (enabled) {
      cb = createSource();
    } else {
      elm.src = getFileSourceUrl(file);
    }

    return cb;
  }, [enabled]);

  return {
    events: {
      onSeeked: handleSeeked,
      onTimeUpdate: handleTimeUpdate,
    } as Pick<DOMAttributes<HTMLVideoElement>, 'onSeeked' | 'onTimeUpdate'>,
  };
};
