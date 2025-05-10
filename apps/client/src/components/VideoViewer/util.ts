import Big from 'big.js';

// 自定义播发结束事件的阈值，单位 s
export const VIDEO_ENDED_THRESHOLD = 0.1;

// 视频编码
export const FILE_CODECS = 'video/mp4; codecs="avc1.640028, mp4a.40.2"';

// 视频分片的长度，单位 s
const VIDEO_SEGMENT_DURATION = 10;

// 继续加载视频分片的最小剩余时间
export const VIDEO_LAZY_LOAD_THRESHOLD = 30;

// 视频最后不满分片长度的最小百分比
// 如果最后一个分片的长度小于 VIDEO_LAST_DURATION_MIN_THRESHOLD，
// 则最后一个分片与上一个完整的分片合并，否则则作为单独的一个分片
const VIDEO_LAST_SEGMENT_THRESHOLD = Big(0.5).mul(VIDEO_SEGMENT_DURATION);

// 可以直接播放的视频后缀名
export const CAN_DIRECT_PLAY_EXTS = ['mp4', 'webm'];

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
export const calcVideoSegmentParams = (currentTime: number, fullDuration: number) => {
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

export const stopStream = (source: MediaSource | null, buffer: SourceBuffer | null) => {
  if (buffer?.updating) buffer?.abort();
  if (source?.readyState === 'open') source.endOfStream();
};

// updateend 有时候 buffer.updating 仍为 true
// 可能是 bug，先用递归判断的方式兜底
export const waitUpdateend = async (buffer: SourceBuffer) => {
  if (buffer.updating) {
    await new Promise(resolve => buffer.addEventListener('updateend', resolve, { once: true }));
    if (buffer.updating) await waitUpdateend(buffer);
  }
};

// 计算 SourceBuffer 的 range 范围
export const calcTimeRanges = (range: TimeRanges) => {
  const timeRanges: [number, number][] = [];
  for (let i = 0; i < range.length; i++) {
    timeRanges.push([range.start(i), range.end(i)]);
  }
  return timeRanges;
};

// 命中缓存区间
export const hitCacheRange = (range: TimeRanges, currentTime: number) => {
  for (let i = 0; i < range.length; i++) {
    const s = range.start(i);
    const e = range.end(i);
    if (s <= currentTime && currentTime <= e) return [s, e];
  }
  return null;
};

// 是否命中缓存
export const isHitCache = (range: TimeRanges, currentTime: number) => {
  return !!hitCacheRange(range, currentTime);
};
