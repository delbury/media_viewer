'use client';

import { FILE_FILTER_OPTIONS } from '#/components/DirectoryPicker/constant';
import ScrollBox from '#/components/ScrollBox';
import ToolGroupBtn from '#/components/ToolGroupBtn';
import { useDialogStateByValue } from '#/hooks/useDialogState';
import { useFormatParentDirHandler } from '#/hooks/useFileTitle';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { useSwr } from '#/hooks/useSwr';
import { formatDate, getFilePosterUrl } from '#/utils';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { getAllMediaFileGroup, INFO_ID_FIELD } from '#pkgs/tools/common';
import { Theme } from '@emotion/react';
import {
  AccessTimeRounded,
  HistoryToggleOffRounded,
  SubscriptionsRounded,
} from '@mui/icons-material';
import { Badge, Chip, Divider, IconButton, ListItemAvatar, SxProps } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo, useState } from 'react';
import PlayDirDialog from './components/PlayDirDialog';
import {
  StyledBtnContainer,
  StyledCardHeader,
  StyledContainer,
  StyledContent,
  StyledCreatedTime,
  StyledImgContainer,
  StyledList,
  StyledListItem,
  StyledListItemText,
  StyledNameRow,
  StyledRecentFileWrapper,
  StyledShortDir,
  StyledToolsRow,
} from './style';
import {
  createTimeSorter,
  getRecentFilesWithParentDir,
  RECENT_FILE_SAME_DIR_COUNT_OPTIONS,
} from './utils';

const SCROLL_BOX_SX: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
};

export default function RecentFile() {
  const t = useTranslations();
  const [filterFileType, setFilterFileType] = useState<MediaFileType>('video');
  const [sameDirMaxCount, setSameDirMaxCount] = useState<number>(
    RECENT_FILE_SAME_DIR_COUNT_OPTIONS[1].value as number
  );

  const treeRequest = useSwr('dirTree');
  const {
    audioList,
    videoList,
    imageList,
    audioCount,
    videoCount,
    imageCount,
    audioSorted,
    videoSorted,
    imageSorted,
  } = useMemo(() => {
    if (!treeRequest.data) return {};

    const {
      lists: { audio, image, video },
      parentMap,
    } = getAllMediaFileGroup(treeRequest.data);

    const { list: audioList, count: audioCount } = getRecentFilesWithParentDir(
      audio.sort(createTimeSorter),
      parentMap,
      treeRequest.data,
      sameDirMaxCount
    );
    const { list: videoList, count: videoCount } = getRecentFilesWithParentDir(
      video.sort(createTimeSorter),
      parentMap,
      treeRequest.data,
      sameDirMaxCount
    );
    const { list: imageList, count: imageCount } = getRecentFilesWithParentDir(
      image.sort(createTimeSorter),
      parentMap,
      treeRequest.data,
      sameDirMaxCount
    );

    return {
      audioSorted: audio,
      videoSorted: video,
      imageSorted: image,
      audioList,
      videoList,
      imageList,
      audioCount,
      videoCount,
      imageCount,
    };
  }, [sameDirMaxCount, treeRequest.data]);

  const { allRecentItems, recentItems, recentItemsCount } = useMemo(() => {
    switch (filterFileType) {
      case 'audio':
        return {
          recentItems: audioList ?? [],
          recentItemsCount: audioCount,
          allRecentItems: audioSorted ?? [],
        };
      case 'image':
        return {
          recentItems: imageList ?? [],
          recentItemsCount: imageCount,
          allRecentItems: imageSorted ?? [],
        };
      case 'video':
        return {
          recentItems: videoList ?? [],
          recentItemsCount: videoCount,
          allRecentItems: videoSorted ?? [],
        };
      default:
        return {
          recentItems: [],
          recentItemsCount: 0,
          allRecentItems: [],
        };
    }
  }, [
    audioCount,
    audioList,
    audioSorted,
    filterFileType,
    imageCount,
    imageList,
    imageSorted,
    videoCount,
    videoList,
    videoSorted,
  ]);

  // 打开媒体浏览器
  const { openMediaViewer } = useMediaViewerContext();

  const handleFileClick = useCallback(
    (file: FileInfo) => {
      openMediaViewer({ file, mediaType: filterFileType, noFileDetailPathDirClickEvent: true });
    },
    [filterFileType, openMediaViewer]
  );

  const handlePlayDirFiles = useCallback(
    (dir: DirectoryInfo) => {
      openMediaViewer({ dir, mediaType: filterFileType, noFileDetailPathDirClickEvent: true });
    },
    [filterFileType, openMediaViewer]
  );

  const handlePlayRecent = useCallback(() => {
    openMediaViewer({
      list: recentItems.map(it => it.files).flat(),
      mediaType: filterFileType,
      noFileDetailPathDirClickEvent: true,
    });
  }, [filterFileType, openMediaViewer, recentItems]);

  const handlePlayRecentAll = useCallback(() => {
    openMediaViewer({
      list: allRecentItems,
      mediaType: filterFileType,
      noFileDetailPathDirClickEvent: true,
    });
  }, [filterFileType, openMediaViewer, allRecentItems]);

  const { visible, stateValue, handleClose, handleOpen } = useDialogStateByValue<DirectoryInfo>();
  const formatParentDir = useFormatParentDirHandler();

  return (
    <StyledRecentFileWrapper>
      <StyledToolsRow>
        <ToolGroupBtn
          exclusive
          items={FILE_FILTER_OPTIONS}
          value={filterFileType}
          onChange={(_, value) => {
            if (!value) return;
            setFilterFileType(value);
          }}
        />

        <StyledBtnContainer>
          <Chip
            size="small"
            onClick={handlePlayRecent}
            icon={
              <HistoryToggleOffRounded
                fontSize="small"
                color="info"
              />
            }
            label={recentItemsCount}
          />

          <Chip
            size="small"
            onClick={handlePlayRecentAll}
            icon={
              <AccessTimeRounded
                fontSize="small"
                color="info"
              />
            }
            label={allRecentItems.length}
          />
        </StyledBtnContainer>
      </StyledToolsRow>

      <StyledToolsRow>
        <div />
        <ToolGroupBtn
          title={t('Setting.SameDirMaxCount')}
          rawLabel
          exclusive
          items={RECENT_FILE_SAME_DIR_COUNT_OPTIONS}
          value={sameDirMaxCount}
          onChange={(_, value) => {
            if (!value) return;
            setSameDirMaxCount(value);
          }}
        />
      </StyledToolsRow>

      <ScrollBox
        sx={SCROLL_BOX_SX}
        isLoading={treeRequest.isLoading}
        key={filterFileType}
      >
        <StyledContainer>
          {recentItems.map(({ parent, files }) => (
            <StyledContent key={parent[INFO_ID_FIELD]}>
              <StyledCardHeader
                title={parent.name}
                subheader={formatParentDir(parent)}
                avatar={
                  <IconButton onClick={() => handlePlayDirFiles(parent)}>
                    <Badge
                      badgeContent={parent.totalMediaFilesCount[filterFileType]}
                      color="secondary"
                    >
                      <SubscriptionsRounded />
                    </Badge>
                  </IconButton>
                }
                slotProps={{
                  content: {
                    onClick: () => handleOpen(parent),
                  },
                }}
              />
              <StyledList>
                {files.map(file => {
                  const createdTime = formatDate(file.created);
                  const posterUrl = getFilePosterUrl(file);
                  let shortDir = file.showDir.replace(parent.showPath, '');
                  shortDir = shortDir ? `...${shortDir}` : './';
                  return (
                    <React.Fragment key={file[INFO_ID_FIELD]}>
                      <StyledListItem onClick={() => handleFileClick(file)}>
                        <ListItemAvatar>
                          <StyledImgContainer>
                            <img
                              src={posterUrl}
                              alt={file.name}
                              loading="lazy"
                            />
                          </StyledImgContainer>
                        </ListItemAvatar>
                        <StyledListItemText
                          disableTypography
                          primary={
                            <StyledNameRow lineClamp={3}>
                              <StyledCreatedTime>{createdTime}</StyledCreatedTime>
                              {file.name}
                            </StyledNameRow>
                          }
                          secondary={<StyledShortDir>{shortDir}</StyledShortDir>}
                        />
                      </StyledListItem>
                      <Divider sx={{ margin: '0 8px' }} />
                    </React.Fragment>
                  );
                })}
              </StyledList>
            </StyledContent>
          ))}
        </StyledContainer>
      </ScrollBox>

      {stateValue && (
        <PlayDirDialog
          visible={visible}
          onClose={handleClose}
          dir={stateValue}
          rootDir={treeRequest.data}
          mediaType={filterFileType}
        />
      )}
    </StyledRecentFileWrapper>
  );
}
