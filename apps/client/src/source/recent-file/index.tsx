'use client';

import ToolGroupBtn from '#/components/DirectoryPicker/components/ToolGroupBtn';
import { FILE_FILTER_OPTIONS } from '#/components/DirectoryPicker/constant';
import ScrollBox from '#/components/ScrollBox';
import { formatParentDir } from '#/hooks/useFileTitle';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { useSwr } from '#/hooks/useSwr';
import { formatDate, getFilePosterUrl } from '#/utils';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { INFO_ID_FIELD, getAllMediaFileGroup } from '#pkgs/tools/common';
import { Theme } from '@emotion/react';
import { SubscriptionsRounded } from '@mui/icons-material';
import { Divider, IconButton, ListItemAvatar, SxProps } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
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
const SAME_DIR_FILE_MAX_COUNT = 5;

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

  return [
    ...map.entries().map(([key, val]) => ({
      parent: key,
      files: val,
    })),
  ];
};

export default function RecentFile() {
  const [filterFileType, setFilterFileType] = useState<MediaFileType>('video');

  const treeRequest = useSwr('dirTree');
  const { audioList, videoList, imageList } = useMemo(() => {
    if (!treeRequest.data) return {};

    const {
      lists: { audio, image, video },
      parentMap,
    } = getAllMediaFileGroup(treeRequest.data);
    const audioList = getRecentFilesWithParentDir(audio.sort(createTimeSorter), parentMap);
    const videoList = getRecentFilesWithParentDir(video.sort(createTimeSorter), parentMap);
    const imageList = getRecentFilesWithParentDir(image.sort(createTimeSorter), parentMap);

    return {
      audioList,
      videoList,
      imageList,
    };
  }, [treeRequest.data]);

  const recentItems = useMemo(() => {
    switch (filterFileType) {
      case 'audio':
        return audioList ?? [];
      case 'image':
        return imageList ?? [];
      case 'video':
        return videoList ?? [];
      default:
        return [];
    }
  }, [audioList, filterFileType, imageList, videoList]);

  // 打开媒体浏览器
  const { openMediaViewer } = useMediaViewerContext();

  const handleFileClick = useCallback(
    (file: FileInfo) => {
      openMediaViewer({ file, mediaType: filterFileType });
    },
    [filterFileType, openMediaViewer]
  );

  const handleDirClick = useCallback(
    (list: FileInfo[]) => {
      openMediaViewer({ list, mediaType: filterFileType });
    },
    [filterFileType, openMediaViewer]
  );

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
                  <IconButton>
                    <SubscriptionsRounded />
                  </IconButton>
                }
                onClick={() => handleDirClick(files)}
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
    </StyledRecentFileWrapper>
  );
}
