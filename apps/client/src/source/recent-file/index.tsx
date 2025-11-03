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
import {
  INFO_ID_FIELD,
  findDirInfoInRootDir,
  getAllMediaFileGroup,
  splitPath,
} from '#pkgs/tools/common';
import { Theme } from '@emotion/react';
import {
  AccessTimeRounded,
  HistoryToggleOffRounded,
  SubscriptionsRounded,
} from '@mui/icons-material';
import { Badge, Chip, Divider, IconButton, ListItemAvatar, SxProps } from '@mui/material';
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

const SCROLL_BOX_SX: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
};

const createTimeSorter = (a: FileInfo, b: FileInfo) => {
  return b.created - a.created;
};

/**
 * 可以按 video / audio / image 筛选
 * 取最近的 N 个文件，相同文件夹下的最多取 M 个文件
 */
const RECENT_FILE_MAX_COUNT = 100;
const SAME_DIR_FILE_MAX_COUNT = 1;

// 前 n 层相同的文件夹可以合并
const CAN_MERGE_SAME_DIR_COUNT = 3;

/**
 * /a/b/c/d/e/f/g
 * /a/b/c/m/p
 * ==>
 * /a/b/c
 *
 * /a/b/c/d/e/f/g
 * /a/b/c/d/t/o
 * ==>
 * /a/b/c/d
 *
 * /a/b/c/d/e/f/g
 * /a/b/y/z
 * xxx
 *
 * /a/b/c/d/e/f/g
 * /1/2/3
 * xxx
 */
const getMergeType = (
  rootDir: DirectoryInfo,
  a: DirectoryInfo,
  b: DirectoryInfo
): DirectoryInfo | null => {
  const pathA = a.showPath + '/';
  const pathB = b.showPath + '/';

  // 父子关系
  if (a.showPath.startsWith(pathB)) return b;
  else if (b.showPath.startsWith(pathA)) return a;

  // 兄弟关系
  const dirsA = splitPath(a.showPath);
  const dirsB = splitPath(b.showPath);
  let curIndex = 0;
  while (curIndex < dirsA.length && curIndex < dirsB.length) {
    if (dirsA[curIndex] === dirsB[curIndex]) {
      curIndex++;
    } else {
      break;
    }
  }

  // 存在相同路径
  if (curIndex >= CAN_MERGE_SAME_DIR_COUNT) {
    const newParent = findDirInfoInRootDir(rootDir, dirsA.slice(0, curIndex));
    return newParent;
  }

  return null;
};

// 获取最近文件并包括父文件夹
const getRecentFilesWithParentDir = (
  files: FileInfo[],
  parentMap: Record<string, DirectoryInfo>,
  rootDir: DirectoryInfo
) => {
  const map = new Map<DirectoryInfo, FileInfo[]>();

  // 还剩的文件数
  let reset = RECENT_FILE_MAX_COUNT;

  for (let i = 0; i < files.length; i++) {
    // 到达上限，结束
    if (reset <= 0) break;
    // 所属文件夹
    const parent = parentMap[files[i][INFO_ID_FIELD]];

    // 初始化数组
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

  /**
   * 合并相同的文件夹
   * n2 遍历，判断当前的 parent 是否可以和其中某个进行合并
   */
  const mergedList: { parent: DirectoryInfo; files: FileInfo[] }[] = [];
  for (const [curParent, curFiles] of map.entries()) {
    let merged = false;
    for (let i = 0; i < mergedList.length; i++) {
      const { parent } = mergedList[i];
      // 判断两个 parent 是否可以合并
      const mergedParent = getMergeType(rootDir, parent, curParent);
      // 无法合并，跳过
      if (!mergedParent) continue;

      mergedList[i].parent = mergedParent;
      // 合并后，合并所有文件
      mergedList[i].files.push(...curFiles);
      merged = true;
      break;
    }
    if (!merged) {
      // 无法合并
      mergedList.push({
        parent: curParent,
        files: curFiles,
      });
    }
  }

  return {
    list: mergedList,
    count: RECENT_FILE_MAX_COUNT - reset,
  };
};

export default function RecentFile() {
  const [filterFileType, setFilterFileType] = useState<MediaFileType>('video');

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
      treeRequest.data
    );
    const { list: videoList, count: videoCount } = getRecentFilesWithParentDir(
      video.sort(createTimeSorter),
      parentMap,
      treeRequest.data
    );
    const { list: imageList, count: imageCount } = getRecentFilesWithParentDir(
      image.sort(createTimeSorter),
      parentMap,
      treeRequest.data
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
  }, [treeRequest.data]);

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
      randomStrategy: 'smallerHigher',
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
