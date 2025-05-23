'use client';

import FileDetailDialog from '#/components/DirectoryPicker/components/FileDetailDialog';
import { FileListContent } from '#/components/FileListPreviewer';
import { HeaderSlot } from '#/components/Header';
import ScrollBox from '#/components/ScrollBox';
import { useConfirmDialog } from '#/hooks/useConfirmDialog';
import { useSwr, useSwrMutation } from '#/hooks/useSwr';
import { FileInfo } from '#pkgs/apis';
import { FILE_INFO_ID_FIELD } from '#pkgs/tools/common';
import { CleaningServicesOutlined } from '@mui/icons-material';
import { Chip, IconButton, SxProps, Theme } from '@mui/material';
import { isNil } from 'lodash-es';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { StyledContent, StyledDirItem, StyledDirs, StyledDislikeListWrapper } from './style';

// const ROW_HEIGHT = 72;
const HEADER_SLOT_BTN_SX: SxProps<Theme> = {
  padding: 0,
};

const DislikeList = () => {
  const [detailFile, setDetailFile] = useState<FileInfo | null>(null);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const listRequest = useSwr('mediaDislikeList');
  const { trigger: removeDislike } = useSwrMutation('mediaDislikeSet');
  const { trigger: clearDislike } = useSwrMutation('mediaDislikeClear');
  const t = useTranslations();

  const selectedFileSet = useMemo(() => {
    const set = new Set<string>();
    listRequest.data?.list.forEach(it => {
      if (it.showDir === selectedDir) {
        set.add(it[FILE_INFO_ID_FIELD]);
      }
    });
    return set;
  }, [selectedDir, listRequest.data]);

  const dirs = useMemo(() => {
    const map = new Map<string, number>();
    listRequest.data?.list.forEach(it => {
      const val = map.get(it.showDir);
      if (isNil(val)) map.set(it.showDir, 1);
      else map.set(it.showDir, val + 1);
    });
    return [...map];
  }, [listRequest.data]);

  const { openConfirmDialog } = useConfirmDialog();

  // 点击图片查看详情
  const handleImgClick = useCallback((file: FileInfo) => {
    setDetailFile(file);
  }, []);

  // 点击选中
  const handleItemClick = useCallback((file: FileInfo) => {
    setSelectedDir(v => (v === file.showDir ? null : file.showDir));
  }, []);

  // 移除 dislike 文件
  const handleItemDelete = useCallback(
    async (file: FileInfo) => {
      openConfirmDialog({
        description: t('Tools.AreYouSureRemoveTheFile'),
        onOk: async () => {
          await removeDislike({
            data: {
              basePathIndex: file.basePathIndex as number,
              relativePath: file.relativePath,
              dislike: false,
            },
          });
          await listRequest.mutate();
        },
      });
    },
    [listRequest, openConfirmDialog, removeDislike, t]
  );

  // 点击文件夹选中
  const handleDirClick = useCallback((dir: string) => {
    setSelectedDir(v => (v === dir ? null : dir));
  }, []);

  // 移除文件夹以及相同文件夹的文件
  const handleDirDelete = useCallback(
    (dir: string) => {
      openConfirmDialog({
        description: t('Tools.AreYouSureRemoveTheDir'),
        onOk: async () => {
          if (!listRequest.data?.list.length) return;
          await clearDislike({
            data: {
              list: listRequest.data.list
                .filter(it => it.showDir === dir)
                .map(it => ({
                  basePathIndex: it.basePathIndex as number,
                  relativePath: it.relativePath,
                })),
            },
          });
          await listRequest.mutate();
        },
      });
    },
    [clearDislike, listRequest, openConfirmDialog, t]
  );

  // 移除所有
  const handleClear = useCallback(() => {
    openConfirmDialog({
      description: t('Tools.AreYouSureRemoveAll'),
      onOk: async () => {
        await clearDislike({ data: { clearAll: true } });
        await listRequest.mutate();
      },
    });
  }, [clearDislike, listRequest, openConfirmDialog, t]);

  return (
    <StyledDislikeListWrapper>
      <StyledDirs>
        <ScrollBox sx={{ height: '100%' }}>
          {dirs.map(d => (
            <StyledDirItem
              key={d[0]}
              selected={selectedDir === d[0]}
              onClick={() => handleDirClick(d[0])}
            >
              <Chip
                size="small"
                label={d[1]}
                onDelete={() => handleDirDelete(d[0])}
              />
              <span>{d[0]}</span>
            </StyledDirItem>
          ))}
        </ScrollBox>
      </StyledDirs>

      <StyledContent>
        <FileListContent
          files={listRequest.data?.list ?? []}
          onImgClick={handleImgClick}
          onItemClick={handleItemClick}
          onItemDelete={handleItemDelete}
          isLoading={listRequest.isLoading}
          selectedIdSet={selectedFileSet}
        />
      </StyledContent>

      {/* 清空列表 */}
      <HeaderSlot>
        <IconButton
          // loading={}
          onClick={handleClear}
          sx={HEADER_SLOT_BTN_SX}
        >
          <CleaningServicesOutlined />
        </IconButton>
      </HeaderSlot>

      {detailFile && (
        <FileDetailDialog
          visible
          file={detailFile}
          onClose={() => setDetailFile(null)}
        />
      )}
    </StyledDislikeListWrapper>
  );
};

export default DislikeList;
