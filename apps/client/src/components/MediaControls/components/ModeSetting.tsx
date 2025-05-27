import { FormatListNumberedRtlRounded, ShuffleRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface ModeSettingProps {
  onClick?: () => void;
  isRandomPlay?: boolean;
}

const ModeSetting = ({ onClick, isRandomPlay }: ModeSettingProps) => {
  return (
    <IconButton onClick={onClick}>
      {isRandomPlay ? <ShuffleRounded /> : <FormatListNumberedRtlRounded />}
    </IconButton>
  );
};

export default ModeSetting;
