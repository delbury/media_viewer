export type FullFileType = 'image' | 'audio' | 'video' | 'text' | 'other';

export type MediaFileType = Extract<FullFileType, 'audio' | 'video' | 'image'>;

export type CodecName =
  | 'av1'
  | 'h264'
  | 'hevc'
  | 'mjpeg'
  | 'mpeg1video'
  | 'mpeg2video'
  | 'mpeg4'
  | 'vc1'
  | 'vp8'
  | 'vp9';

// 音频视频文件的流信息
export interface MediaStream {
  index: 0;
  codec_name: CodecName;
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
