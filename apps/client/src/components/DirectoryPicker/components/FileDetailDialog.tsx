import Dialog from '#/components/Dialog';
import PosterImage from '#/components/PosterImage';
import { useSwr } from '#/hooks/useSwr';
import { formatDate, formatFileSize, formatTime } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { isMediaFile, splitPath } from '#pkgs/tools/common';
import { LoopOutlined } from '@mui/icons-material';
import { Box, IconButton, TabsOwnProps } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo, useState } from 'react';
import { FULL_FILE_FILTER_MAP } from '../constant';
import {
  StyledContentContainer,
  StyledFileDetailLabel,
  StyledFileDetailValue,
  StyledFileDetailWrapper,
  StyledFileItem,
  StyledFilePosterInner,
  StyledFilePosterWrapper,
  StyledJsonContainer,
  StyledPathItem,
  StyledTab,
  StyledTabs,
} from '../style/file-detail-dialog';

// const getTitleIcon = (fileType: FullFileType, sx?: SxProps<Theme>) => {
//   if (fileType === 'video' || fileType === 'audio') {
//     return <PlayCircleOutlineRounded sx={sx} />;
//   } else if (fileType === 'image') {
//     return <PhotoOutlined sx={sx} />;
//   }
//   return null;
// };

// 渲染路径信息
export const renderPathInfo = (
  path?: string,
  onPathClick?: (paths: string[]) => void,
  { lastClickable }: { lastClickable?: boolean } = {}
): React.ReactNode => {
  if (!path) return null;
  const paths = splitPath(path);

  return (
    <Box sx={{ lineHeight: onPathClick ? 2 : void 0 }}>
      {paths.map((p, i) => (
        <span key={`${p}/${i}`}>
          /
          {!lastClickable && (i === paths.length - 1 || !onPathClick) ? (
            <StyledFileItem>{p}</StyledFileItem>
          ) : (
            <StyledPathItem onClick={() => onPathClick?.(paths.slice(0, i + 1))}>
              {p}
            </StyledPathItem>
          )}
        </span>
      ))}
    </Box>
  );
};

enum InfoType {
  Base = 'base',
  Metadata = 'metadata',
}

interface FileDetailDialogProps {
  file: FileInfo;
  visible: boolean;
  onClose: () => void;
  hidePoster?: boolean;
  onPathClick?: (paths: string[]) => void;
}

const FileDetailDialog = ({
  file,
  visible,
  onClose,
  hidePoster,
  onPathClick,
}: FileDetailDialogProps) => {
  const t = useTranslations();
  const [currentTab, setCurrentTab] = useState<InfoType>(InfoType.Base);
  const [imgKey, setImgKey] = useState(false);
  const fileInfos: { label: string; value: React.ReactNode }[] = useMemo(() => {
    return [
      { label: t('File.Name'), value: file.name },
      { label: t('File.Path'), value: renderPathInfo(file.showPath, onPathClick) },
      { label: t('File.Type'), value: t(FULL_FILE_FILTER_MAP[file.fileType]) },
      { label: t('File.Size'), value: formatFileSize(file.size) },
      { label: t('File.Duration'), value: formatTime(file.duration) },
      { label: t('File.Created'), value: formatDate(file.created) },
      { label: t('File.Updated'), value: formatDate(file.updated) },
    ];
  }, [file, onPathClick, t]);

  // 是否展示缩略图
  const isMedia = useMemo(() => isMediaFile(file.fileType), [file.fileType]);

  // 请求视频元信息
  const metadataRequest = useSwr('mediaMetadata', {
    params: {
      basePathIndex: file.basePathIndex?.toString() as string,
      relativePath: file.relativePath,
    },
    lazy: true,
    disabled: !isMedia,
  });

  const metadataJson = useMemo(
    () => JSON.stringify(metadataRequest.data, null, 2),
    [metadataRequest.data]
  );

  const handleTabChange = useCallback<NonNullable<TabsOwnProps['onChange']>>(
    (_, val) => {
      setCurrentTab(val);
      if (val === InfoType.Metadata) metadataRequest.mutate();
    },
    [metadataRequest]
  );

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      title={
        <>
          {/* {getTitleIcon(file.fileType, { marginInlineEnd: '8px' })} */}
          {file.name}
        </>
      }
      onlyClose
      dialogProps={{
        maxWidth: 'xs',
      }}
      leftFooterSlot={
        isMedia && (
          <IconButton
            onClick={() => {
              // 刷新图片
              setImgKey(v => !v);
            }}
          >
            <LoopOutlined />
          </IconButton>
        )
      }
    >
      <StyledTabs
        value={currentTab}
        onChange={handleTabChange}
        centered
      >
        <StyledTab
          value={InfoType.Base}
          label={t('Common.BaseInfo')}
        />
        {isMedia && (
          <StyledTab
            value={InfoType.Metadata}
            label={t('Common.Metadata')}
          />
        )}
      </StyledTabs>

      <StyledContentContainer>
        {currentTab === InfoType.Base && (
          <>
            <StyledFileDetailWrapper>
              {fileInfos.map(info => (
                <React.Fragment key={info.label}>
                  <StyledFileDetailLabel>
                    {info.label}
                    {t(':')}
                  </StyledFileDetailLabel>
                  <StyledFileDetailValue>{info.value || t('-')}</StyledFileDetailValue>
                </React.Fragment>
              ))}
            </StyledFileDetailWrapper>

            {isMedia && !hidePoster && (
              <StyledFilePosterWrapper>
                <StyledFilePosterInner>
                  <PosterImage
                    file={file}
                    key={imgKey.toString()}
                  />
                </StyledFilePosterInner>
              </StyledFilePosterWrapper>
            )}
          </>
        )}

        {isMedia && currentTab === InfoType.Metadata && (
          <StyledJsonContainer>
            <pre>{metadataJson}</pre>
          </StyledJsonContainer>
        )}
      </StyledContentContainer>
    </Dialog>
  );
};

export default FileDetailDialog;
