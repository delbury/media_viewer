import { formatDate, formatFileSize, formatTime } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { StyledFileExtraInfoItem, StyledFileExtraInfoWrapper } from '../style';

const FileExtraInfo = ({ file }: { file: FileInfo }) => {
  const t = useTranslations();

  const fileInfos: { label: string; value: React.ReactNode }[] = useMemo(() => {
    return [
      { label: t('File.Created'), value: formatDate(file.created) },
      { label: t('File.Updated'), value: formatDate(file.updated) },
      { label: t('File.Duration'), value: formatTime(file.duration) },
      { label: t('File.Size'), value: formatFileSize(file.size, { toK: true, fixed: 0 }) },
    ];
  }, [file, t]);

  return (
    <StyledFileExtraInfoWrapper>
      {fileInfos.map(info => (
        <StyledFileExtraInfoItem key={info.label}>
          <span>{info.label}</span>
          <span>{info.value || t('-')}</span>
        </StyledFileExtraInfoItem>
      ))}
    </StyledFileExtraInfoWrapper>
  );
};

export default FileExtraInfo;
