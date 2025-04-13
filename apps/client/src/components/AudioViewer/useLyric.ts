import { useSwr } from '#/hooks/useSwr';
import { FileInfo } from '#pkgs/apis';
import { useEffect, useState } from 'react';

export interface LyricRow {
  timeString: string;
  timeNumber: number;
  words: string;
}

export interface LydicMeta {
  al?: string;
  ar?: string;
  au?: string;
  by?: string;
  offset?: string;
  re?: string;
  ti?: string;
  ve?: string;
  [key: string]: string | undefined;
}

// meta 行匹配
const metaReg = /\[(.+):(.*)\]/;
// 歌词行匹配
const lyricReg = /\[(\d+):(\d+\.\d+)\](.*)/;

const parseLyric = (text: string) => {
  const textList = text.split(/\n/);
  const meta: LydicMeta = {};
  const lyrics: LyricRow[] = [];

  for (const row of textList) {
    if (!row) continue;

    const lyricMatchedRes = row.match(lyricReg);
    if (lyricMatchedRes) {
      lyrics.push({
        timeString: `${lyricMatchedRes[1]}:${lyricMatchedRes[2]}`,
        timeNumber: parseFloat(lyricMatchedRes[1]) * 60 + parseFloat(lyricMatchedRes[2]),
        words: lyricMatchedRes[3],
      });
      continue;
    }

    const metaMatchedRes = row.match(metaReg);
    if (metaMatchedRes) {
      meta[metaMatchedRes[1]] = metaMatchedRes[2];
      continue;
    }
  }

  return {
    meta,
    lyrics,
  };
};

// 查找当前播放时刻应该属于第 n 句歌词
// n <= currentTime < n + 1
export const findLyricIndex = (currentTime: number, lyrics: LyricRow[], currentIndex: number) => {
  // 现根据之前的 index 来查找，优化连续播放时的性能
  if (currentTime >= lyrics[currentIndex].timeNumber) {
    if (currentTime < lyrics[currentIndex + 1]?.timeNumber) return currentIndex;
    if (currentTime < lyrics[currentIndex + 2]?.timeNumber) return currentIndex + 1;
  }

  // 二分查找
  let l = 0;
  let r = lyrics.length - 1;
  while (l < r) {
    if (currentTime >= lyrics[r].timeNumber) return r;

    const m = Math.floor((l + r) / 2);
    if (currentTime >= lyrics[m].timeNumber && currentTime < lyrics[m + 1].timeNumber) {
      return m;
    } else if (currentTime < lyrics[m].timeNumber) {
      r = m - 1;
    } else {
      l = m + 1;
    }
  }
  return l;
};

// 解析歌词文件
export const useLyric = (file: FileInfo) => {
  const [lyrics, setLyrics] = useState<LyricRow[]>([]);
  const [meta, setMeta] = useState<LydicMeta>({});

  const lyricRequest = useSwr('fileText', {
    disabled: !file.lrcPath,
    params: {
      basePathIndex: file.basePathIndex.toString(),
      relativePath: file.lrcPath as string,
    },
  });

  // 歌词文本字符串
  const text = lyricRequest.data?.content;

  useEffect(() => {
    if (text) {
      const res = parseLyric(text);
      setLyrics(res.lyrics);
      setMeta(res.meta);
    } else {
      setLyrics([]);
      setMeta({});
    }
  }, [text]);

  return {
    lyrics,
    meta,
    isLoading: lyricRequest.isLoading,
    hasLyric: !!lyrics.length,
  };
};
