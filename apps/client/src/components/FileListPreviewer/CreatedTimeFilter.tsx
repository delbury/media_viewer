import RangeSlider, { getRealValue } from '#/components/RangeSlider';
import { AllInclusiveRounded } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { StyledFilterLabel } from './style';

export const FILE_LIST_FILTER_CREATED_TIME_KEY = 'fileListPreviewCreatedTimeRange';

const CREATED_TIME_OPTIONS = [
  {
    label: (
      <AllInclusiveRounded
        fontSize="inherit"
        style={{ marginTop: '2px' }}
      />
    ),
    value: Infinity,
  },
  { label: '-1Y', value: 30 * 12 },
  { label: '-6M', value: 30 * 6 },
  { label: '-3M', value: 30 * 3 },
  { label: '-1M', value: 30 },
  { label: '-7d', value: 7 },
  { label: '-3D', value: 3 },
  { label: '-1D', value: 1 },
  { label: '0', value: 0 },
];

export const DEFAULT_CREATED_TIME_RANGE = [0, CREATED_TIME_OPTIONS.length - 1];

export const getRealCreatedTimeValue = (indexes: number[]) =>
  getRealValue(indexes, CREATED_TIME_OPTIONS);

interface CreatedFilterProps {
  onChange?: (val: number[]) => void;
}

const CreatedTimeFilter = ({ onChange }: CreatedFilterProps) => {
  const t = useTranslations();

  return (
    <RangeSlider
      onChange={onChange}
      defaultRange={DEFAULT_CREATED_TIME_RANGE}
      storageKey={FILE_LIST_FILTER_CREATED_TIME_KEY}
      options={CREATED_TIME_OPTIONS}
      label={<StyledFilterLabel>{t('File.Created')}</StyledFilterLabel>}
    />
  );
};

export default CreatedTimeFilter;
