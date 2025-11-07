import { useDebounce } from '#/hooks/useDebounce';
import { usePersistentConfig } from '#/hooks/usePersistentConfig';
import { AllInclusiveRounded } from '@mui/icons-material';
import { SliderProps } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { StyledSlider, StyledWrapper } from './style';

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

const MAX = DURATION_OPTIONS.length - 1;
const DEFAULT_DURATION_RANGE = [0, MAX];

const MARKS = DURATION_OPTIONS.map((it, index) => ({
  label: it.label,
  realValue: it.value,
  value: index,
}));

interface DurationFilterProps {
  onChange?: (val: number[]) => void;
}

const DurationFilter = ({ onChange }: DurationFilterProps) => {
  const [value, setValue] = usePersistentConfig<number[]>(
    DEFAULT_DURATION_RANGE,
    'fileListPreviewDurationRange'
  );

  const handleRealValueChange = useCallback(
    (val: number[]) => {
      onChange?.(val.map(it => DURATION_OPTIONS[it].value));
    },
    [onChange]
  );

  const handleRealValueChangeIdle = useDebounce(handleRealValueChange, 800);

  const handleChange = useCallback<NonNullable<SliderProps['onChange']>>(
    (_, val) => {
      if (Array.isArray(val)) {
        setValue(val);
        handleRealValueChangeIdle?.(val);
      }
    },
    [handleRealValueChangeIdle, setValue]
  );

  useEffect(() => {
    handleRealValueChangeIdle?.(value);
  }, []);

  return (
    <StyledWrapper>
      <StyledSlider
        size="small"
        min={0}
        max={MAX}
        step={1}
        value={value}
        onChange={handleChange}
        marks={MARKS}
      />
    </StyledWrapper>
  );
};

export default DurationFilter;
