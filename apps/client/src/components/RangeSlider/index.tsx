import { useDebounce } from '#/hooks/useDebounce';
import { usePersistentConfig } from '#/hooks/usePersistentConfig';
import { SliderProps } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { StyledSlider, StyledWrapper } from './style';

export interface RangeSliderOption {
  label: React.ReactNode;
  value: number;
}

export const getRealValue = (indexes: number[], options: RangeSliderOption[]) =>
  indexes.map(ind => options[ind].value);

interface DurationFilterProps {
  onChange?: (val: number[]) => void;
  defaultRange: number[];
  storageKey?: string;
  options: RangeSliderOption[];
}

const RangeSlider = ({ defaultRange, storageKey, options, onChange }: DurationFilterProps) => {
  const [value, setValue] = usePersistentConfig<number[]>(defaultRange, storageKey, {
    lazySave: true,
  });

  const handleRealValueChange = useCallback(
    (val: number[]) => {
      onChange?.(val.map(it => options[it].value));
    },
    [onChange, options]
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

  const { max, marks } = useMemo(() => {
    const marks = options.map((it, index) => ({
      label: it.label,
      realValue: it.value,
      value: index,
    }));

    return {
      max: options.length - 1,
      marks,
    };
  }, [options]);

  return (
    <StyledWrapper>
      <StyledSlider
        size="small"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={handleChange}
        marks={marks}
      />
    </StyledWrapper>
  );
};

export default RangeSlider;
