import { fetchArrayBufferData } from '#/request';
import { getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useTranslations } from 'next-intl';
import { RefObject, useCallback, useEffect, useState } from 'react';

interface UseMediaSourceParams {
  mediaRef: RefObject<HTMLMediaElement | null>;
  file: FileInfo;
  // 启用
  enabled: boolean;
}

const FILE_CODECS = 'video/mp4; codecs="avc1.640028, mp4a.40.2"';

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
  const [sourceType, setSourceType] = useState<'raw' | 'mediaSource' | null>(null);
  // const mediaSource = useRef<MediaSource>(null);

  // 创建 media source
  const createSource = useCallback(() => {
    const elm = mediaRef.current;
    if (elm) {
      const source = new MediaSource();
      // mediaSource.current = source;
      const src = URL.createObjectURL(source);
      // 绑定源
      elm.src = src;
      let abortController: AbortController | null = null;
      let buffer: SourceBuffer | null = null;
      let reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> | null = null;

      // 开始事件
      source.addEventListener(
        'sourceopen',
        async () => {
          // 创建并添加 buffer
          buffer = source.addSourceBuffer(FILE_CODECS);

          try {
            // 请求资源
            const { response, controller } = await fetchArrayBufferData('fileVideoFallback', {
              params: {
                basePathIndex: file.basePathIndex.toString(),
                relativePath: file.relativePath,
              },
            });
            abortController = controller;
            controller.signal.onabort = () => {
              // 中断 fetch 请求后，结束流
              if (source.readyState === 'open') source.endOfStream();
            };

            // 读取流
            reader = response?.body?.getReader() ?? null;
            if (!reader) throw new Error(t('Error.NetError'));

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              await waitUpdateend(buffer);
              // 如果此时流已经结束了，则直接结束
              if (!Array.from(source.sourceBuffers).includes(buffer)) break;
              buffer.appendBuffer(value);
            }
          } catch {
            // 流中断后，直接中断 fetch 请求
            abortController?.abort();
          } finally {
            // 结束流
            if (source.readyState === 'open') source.endOfStream();
          }
        },
        { once: true }
      );

      return () => {
        if (buffer?.updating) buffer.abort();
        if (source.readyState === 'open') source.endOfStream();
        abortController?.abort();
      };
    }
  }, [file.basePathIndex, file.relativePath, mediaRef, t]);

  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;

    let cb: (() => void) | undefined;

    if (enabled) {
      cb = createSource();
      setSourceType('mediaSource');
    } else {
      elm.src = getFileSourceUrl(file);
      setSourceType('raw');
    }

    return cb;
  }, [enabled]);

  return {
    sourceType,
  };
};
