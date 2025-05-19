import { useDislikeFile } from '#/hooks/useDislikeFile';
import { FileInfo } from '#pkgs/apis';
import { ThumbDownAltRounded, ThumbDownOffAltRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface DislikeSettingProps {
  file?: FileInfo;
}

const DislikeSetting = ({ file }: DislikeSettingProps) => {
  const { dislike, toggleDislike } = useDislikeFile({ file });

  return (
    <IconButton
      disabled={!file}
      onClick={toggleDislike}
    >
      {dislike ? <ThumbDownAltRounded color="warning" /> : <ThumbDownOffAltRounded />}
    </IconButton>
  );
};

export default DislikeSetting;
