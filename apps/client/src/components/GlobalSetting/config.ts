import { ItemOption } from '../ToolGroupBtn';

export const DIR_PATH_REVERSE_KEY = 'dirPathReverse';
export const VIDEO_DURATION_ROUND_TO_KEY = 'videoDurationRoundTo';
export const FILE_SIZE_ROUND_TO_KEY = 'fileSizeRoundTo';
export const RANDOM_PLAY_STRATEGY_KEY = 'randomPlayStrategy';

export const DURATION_ROUND_TO_OPTIONS: ItemOption[] = [
  // { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '10', value: 10 },
];

export enum RandomPlayStrategy {
  Default,
  NewFirst,
  OldFirst,
}

export const RANDOM_PLAY_STRATEGIES: ItemOption[] = [
  { label: 'Common.Default', value: RandomPlayStrategy.Default },
  { label: 'Setting.NewFirst', value: RandomPlayStrategy.NewFirst },
  { label: 'Setting.OldFirst', value: RandomPlayStrategy.OldFirst },
];
