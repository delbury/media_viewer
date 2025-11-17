import RangeSlider, { getRealValue } from '#/components/RangeSlider';
import { AllInclusiveRounded } from '@mui/icons-material';

export const FILE_LIST_PREVIEW_KEY = 'fileListPreviewDurationRange';

const DURATION_OPTIONS = [
  { label: '0', value: 0 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 60 * 5 },
  { label: '30m', value: 60 * 30 },
  { label: '1h', value: 60 * 60 },
  {
    label: <AllInclusiveRounded fontSize="inherit" />,
    value: Infinity,
  },
];

export const DEFAULT_DURATION_RANGE = [0, DURATION_OPTIONS.length - 1];

export const getRealDurationValue = (indexes: number[]) => getRealValue(indexes, DURATION_OPTIONS);

interface DurationFilterProps {
  onChange?: (val: number[]) => void;
}

const DurationFilter = ({ onChange }: DurationFilterProps) => {
  return (
    <RangeSlider
      onChange={onChange}
      defaultRange={DEFAULT_DURATION_RANGE}
      storageKey={FILE_LIST_PREVIEW_KEY}
      options={DURATION_OPTIONS}
    />
  );
};

export default DurationFilter;
