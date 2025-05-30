import { useSwrMutation } from '#/hooks/useSwr';
import { FileInfo } from '#pkgs/apis';
import { ThumbDownAltRounded, ThumbDownOffAltRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

interface DislikeSettingProps {
  file?: FileInfo;
}

const DislikeSetting = ({ file }: DislikeSettingProps) => {
  // const { dislike, toggleDislike } = useDislikeFile({ file });
  const [dislike, setDislike] = useState(false);

  const { trigger: getTrigger, isLoading: getLoading } = useSwrMutation('mediaDislikeGet');
  const { trigger: setTrigger, isLoading: setLoading } = useSwrMutation('mediaDislikeSet');

  // 加载初始状态
  useEffect(() => {
    if (!file) return;
    getTrigger({
      params: {
        basePathIndex: file.basePathIndex?.toString() as string,
        relativePath: file.relativePath,
      },
    }).then(res => {
      setDislike(!!res.data?.dislike);
    });
  }, [file, getTrigger]);

  const handleToggleDislike = useCallback(async () => {
    if (!file) return;
    const newVal = !dislike;
    await setTrigger({
      data: {
        dislike: newVal,
        basePathIndex: file.basePathIndex,
        relativePath: file.relativePath,
      },
    });
    setDislike(newVal);
  }, [dislike, file, setTrigger]);

  return (
    <IconButton
      disabled={!file}
      onClick={handleToggleDislike}
      loading={setLoading || getLoading}
    >
      {dislike ? <ThumbDownAltRounded color="warning" /> : <ThumbDownOffAltRounded />}
    </IconButton>
  );
};

export default DislikeSetting;
