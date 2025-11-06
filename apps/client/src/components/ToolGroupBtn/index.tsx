import { ToggleButtonGroupProps, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { StyledSelectedBadge, StyledToggleButton, StyledToggleButtonGroup } from './style';

export interface ItemOption {
  value: string | number;
  label: string;
}

const ToolGroupBtn = ({
  items,
  showOrder,
  value,
  rawLabel,
  required,
  onChange,
  ...props
}: ToggleButtonGroupProps & {
  items: ItemOption[];
  showOrder?: boolean;
  rawLabel?: boolean;
  required?: boolean;
}) => {
  const t = useTranslations();

  const handleChange = useCallback<NonNullable<typeof onChange>>(
    (_, val) => {
      if (required && val === null) return;
      onChange?.(_, val);
    },
    [onChange, required]
  );

  return (
    <StyledToggleButtonGroup
      color="primary"
      size="small"
      value={value}
      onChange={handleChange}
      {...props}
    >
      {items.map(item => {
        const order =
          showOrder && Array.isArray(value)
            ? (value?.findIndex((field: string) => field === item.value) ?? -1) + 1
            : 0;

        return (
          <StyledToggleButton
            key={item.value}
            value={item.value}
          >
            <Typography variant="body2">{rawLabel ? item.label : t(item.label)}</Typography>
            {!!showOrder && !!order && <StyledSelectedBadge>{order}</StyledSelectedBadge>}
          </StyledToggleButton>
        );
      })}
    </StyledToggleButtonGroup>
  );
};

export default ToolGroupBtn;
