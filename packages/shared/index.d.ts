export type FullFileType = 'image' | 'audio' | 'video' | 'text' | 'other';

export type MediaFileType = Extract<FullFileType, 'audio' | 'video' | 'image'>;

// 音频视频文件的流信息
export interface MediaStream {
  index: 0;
  codec_name: string;
  codec_type: 'video' | 'audio';
  disposition: {
    default: number;
  };
}

export interface MediaMeta {
  filename: string;
  format_name: string;
  duration: string;
  size: string;
  bit_rate: string;
}

export interface MediaDetailInfo {
  streams: MediaStream[];
  format: MediaMeta;
}
