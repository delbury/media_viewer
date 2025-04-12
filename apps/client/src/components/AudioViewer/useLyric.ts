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

// 解析歌词文件
export const useLyric = (text?: string) => {
  const [lyrics, setLyrics] = useState<LyricRow[]>([]);
  const [meta, setMeta] = useState<LydicMeta>({});

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
  };
};
