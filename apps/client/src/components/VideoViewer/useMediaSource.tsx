import { useSwr } from '#/hooks/useSwr';
import { fetchArrayBufferData } from '#/request';
import { getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useTranslations } from 'next-intl';
import { RefObject, useCallback, useEffect } from 'react';

interface UseMediaSourceParams {
  mediaRef: RefObject<HTMLMediaElement | null>;
  file: FileInfo;
  // 启用
  enabled: boolean;
}

const FILE_CODECS = 'video/mp4; codecs="avc1.640028, mp4a.40.2"';

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

export const useMediaSource = ({ mediaRef, file, enabled }: UseMediaSourceParams) => {
  const t = useTranslations();

  const metadataRequest = useSwr('fileVideoMetadata', {
    params: {
      basePathIndex: file.basePathIndex.toString(),
      relativePath: file.relativePath,
    },
    lazy: true,
    disabled: !enabled,
    noticeWhenSuccess: false,
  });

  // 创建 media source
  const createSource = useCallback(() => {
    const elm = mediaRef.current;
    if (elm) {
      const mediaSource = new MediaSource();
      const src = URL.createObjectURL(mediaSource);
      // 绑定源
      elm.src = src;
      const abortController = new AbortController();
      let buffer: SourceBuffer | null = null;
      let reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> | null = null;

      // 开始事件
      mediaSource.addEventListener(
        'sourceopen',
        async () => {
          // 获取视频的总长度
          const metadataInfo = await metadataRequest.mutate();
          const videoDuration = metadataInfo?.data?.duration ?? NaN;

          // 创建并添加 buffer
          buffer = mediaSource.addSourceBuffer(FILE_CODECS);

          buffer.addEventListener(
            'updateend',
            async () => {
              // 手动设置时长
              mediaSource.duration = videoDuration;
            },
            { once: true }
          );

          try {
            // 请求资源
            const response = await fetchArrayBufferData('fileVideoFallback', {
              params: {
                basePathIndex: file.basePathIndex.toString(),
                relativePath: file.relativePath,
              },
              signal: abortController.signal,
            });
            abortController.signal.onabort = () => {
              // 中断 fetch 请求后，结束流
              stopStream(mediaSource, buffer);
            };

            // 读取流
            reader = response?.body?.getReader() ?? null;
            if (!reader) throw new Error(t('Error.NetError'));

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              await waitUpdateend(buffer);
              // 如果此时流已经结束了，则直接结束
              if (!Array.from(mediaSource.sourceBuffers).includes(buffer)) break;
              buffer.appendBuffer(value);
            }
          } catch {
            // 流中断后，直接中断 fetch 请求
            abortController?.abort();
          } finally {
            // 结束流
            stopStream(mediaSource, buffer);
          }
        },
        { once: true }
      );

      return () => {
        stopStream(mediaSource, buffer);
        abortController.abort();
      };
    }
  }, [file.basePathIndex, file.relativePath, mediaRef, metadataRequest, t]);

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
};
