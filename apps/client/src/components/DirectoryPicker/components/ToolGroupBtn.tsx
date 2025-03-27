import { ToggleButtonGroupProps, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StyledToggleButtonGroup } from '../style/file-item-list';
import { StyledSelectedBadge, StyledToggleButton } from '../style/tool-group-btn';

const ToolGroupBtn = ({
  items,
  showOrder,
  value,
  rawLabel,
  ...props
}: ToggleButtonGroupProps & {
  items: {
    value: string;
    label: string;
  }[];
  showOrder?: boolean;
  rawLabel?: boolean;
}) => {
  const t = useTranslations();

  return (
    <StyledToggleButtonGroup
      color="primary"
      size="small"
      value={value}
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
