'use client';

import ToolGroupBtn from '#/components/DirectoryPicker/components/ToolGroupBtn';
import { FILE_FILTER_OPTIONS } from '#/components/DirectoryPicker/constant';
import ScrollBox from '#/components/ScrollBox';
import { useDialogStateByValue } from '#/hooks/useDialogState';
import { formatParentDir } from '#/hooks/useFileTitle';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { useSwr } from '#/hooks/useSwr';
import { formatDate, getFilePosterUrl } from '#/utils';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { INFO_ID_FIELD, getAllMediaFileGroup } from '#pkgs/tools/common';
import { Theme } from '@emotion/react';
import { PlayCircleRounded, SubscriptionsRounded } from '@mui/icons-material';
import { Badge, Chip, Divider, IconButton, ListItemAvatar, SxProps } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import PlayDirDialog from './components/PlayDirDialog';
import {
  StyledCardHeader,
  StyledContainer,
  StyledContent,
  StyledCreatedTime,
  StyledImgContainer,
  StyledList,
  StyledListItem,
  StyledListItemText,
  StyledRecentFileWrapper,
  StyledToolsRow,
} from './style';

const createTimeSorter = (a: FileInfo, b: FileInfo) => {
  return b.created - a.created;
};

/**
 * 可以按 video / audio / image 筛选
 * 取最近的 N 个文件，相同文件夹下的最多取 M 个文件
 */
const RECENT_FILE_MAX_COUNT = 100;
const SAME_DIR_FILE_MAX_COUNT = 3;

const SCROLL_BOX_SX: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
};

// 获取最近文件并包括父文件夹
const getRecentFilesWithParentDir = (
  files: FileInfo[],
  parentMap: Record<string, DirectoryInfo>
) => {
  const map = new Map<DirectoryInfo, FileInfo[]>();

  // 还剩的文件数
  let reset = RECENT_FILE_MAX_COUNT;
  for (let i = 0; i < files.length; i++) {
    // 到达上限，跳过
    if (reset <= 0) break;
    const parent = parentMap[files[i][INFO_ID_FIELD]];
    let list = map.get(parent);
    if (!list) {
      list = [];
      map.set(parent, list);
    }
    // 到达上限，跳过
    if (list.length >= SAME_DIR_FILE_MAX_COUNT) continue;
    list.push(files[i]);
    reset--;
  }

  return {
    list: [
      ...map.entries().map(([key, val]) => ({
        parent: key,
        files: val,
      })),
    ],
    count: RECENT_FILE_MAX_COUNT - reset,
  };
};

export default function RecentFile() {
  const [filterFileType, setFilterFileType] = useState<MediaFileType>('video');

  const treeRequest = useSwr('dirTree');
  const { audioList, videoList, imageList, audioCount, videoCount, imageCount } = useMemo(() => {
    if (!treeRequest.data) return {};

    const {
      lists: { audio, image, video },
      parentMap,
    } = getAllMediaFileGroup(treeRequest.data);
    const { list: audioList, count: audioCount } = getRecentFilesWithParentDir(
      audio.sort(createTimeSorter),
      parentMap
    );
    const { list: videoList, count: videoCount } = getRecentFilesWithParentDir(
      video.sort(createTimeSorter),
      parentMap
    );
    const { list: imageList, count: imageCount } = getRecentFilesWithParentDir(
      image.sort(createTimeSorter),
      parentMap
    );

    return {
      audioList,
      videoList,
      imageList,
      audioCount,
      videoCount,
      imageCount,
    };
  }, [treeRequest.data]);

  const { recentItems, recentItemsCount } = useMemo(() => {
    switch (filterFileType) {
      case 'audio':
        return {
          recentItems: audioList ?? [],
          recentItemsCount: audioCount,
        };
      case 'image':
        return {
          recentItems: imageList ?? [],
          recentItemsCount: imageCount,
        };
      case 'video':
        return {
          recentItems: videoList ?? [],
          recentItemsCount: videoCount,
        };
      default:
        return {
          recentItems: [],
          recentItemsCount: 0,
        };
    }
  }, [audioCount, audioList, filterFileType, imageCount, imageList, videoCount, videoList]);

  // 打开媒体浏览器
  const { openMediaViewer } = useMediaViewerContext();

  const handleFileClick = useCallback(
    (file: FileInfo) => {
      openMediaViewer({ file, mediaType: filterFileType });
    },
    [filterFileType, openMediaViewer]
  );

  const handlePlayDirFiles = useCallback(
    (list: FileInfo[]) => {
      openMediaViewer({ list, mediaType: filterFileType });
    },
    [filterFileType, openMediaViewer]
  );

  const handlePlayRecent = useCallback(() => {
    openMediaViewer({ list: recentItems.map(it => it.files).flat(), mediaType: filterFileType });
  }, [filterFileType, openMediaViewer, recentItems]);

  const { visible, stateValue, handleClose, handleOpen } = useDialogStateByValue<DirectoryInfo>();

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

        <Chip
          size="small"
          onClick={handlePlayRecent}
          icon={
            <PlayCircleRounded
              fontSize="small"
              color="info"
            />
          }
          label={recentItemsCount}
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
                  <IconButton onClick={() => handlePlayDirFiles(parent.files)}>
                    <Badge
                      badgeContent={parent.files.length}
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
                  return (
                    <React.Fragment key={file[INFO_ID_FIELD]}>
                      <StyledListItem onClick={() => handleFileClick(file)}>
                        <ListItemAvatar>
                          <StyledImgContainer>
                            <img
                              src={posterUrl}
                              alt={file.name}
                            />
                          </StyledImgContainer>
                        </ListItemAvatar>
                        <StyledListItemText
                          disableTypography
                          primary={
                            <span>
                              <StyledCreatedTime>{createdTime}</StyledCreatedTime>
                              {file.name}
                            </span>
                          }
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
