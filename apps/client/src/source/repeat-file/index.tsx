'use client';

import { Box, SxProps, Theme } from '@mui/material';
import dynamic from 'next/dynamic';

const FileBrowser = dynamic(
  () => import('#/components/DirectoryPicker').then(mod => mod.FileBrowser),
  {
    ssr: false,
  }
);

const WRAPPER_SX: SxProps<Theme> = {
  height: 'calc(100vh - 72px)',
};

/**
 * 分析处理重复的视频文件
 * 步骤：
 * 1. 选择需要处理的根文件夹，分析处理选择的文件夹下的所有文件
 * 2. （可选）勾选是否【将已选根文件夹下所有子文件夹单独处理】，即以子文件为界限批量处理
 * 3. 搜索查询选中文件夹下所有的视频文件，记录视频时长和文件大小
 * 4. 所有视频文件按时长顺序排序，过滤所有短视频，< 30s
 */

export default function RepeatFile() {
  return (
    <Box sx={WRAPPER_SX}>
      <FileBrowser storageKeySuffix="RepeatFile" />
    </Box>
  );
}
