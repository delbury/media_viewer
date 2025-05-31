import { TFunction } from '#/types/i18n';
import {
  CalculateRounded,
  HandymanOutlined,
  HomeWorkOutlined,
  ScheduleRounded,
  SvgIconComponent,
  ThumbDownAltRounded,
  TopicRounded,
} from '@mui/icons-material';
import { pick } from 'lodash-es';
import { ReactElement } from 'react';

const ROUTES: Record<
  string,
  {
    titleKey?: string;
    path: string;
    icon: ReactElement<SvgIconComponent>;
  }
> = {
  home: {
    path: '/',
    icon: <HomeWorkOutlined />,
  },
  tools: {
    path: '/tools',
    icon: <HandymanOutlined />,
  },
  recentFiles: {
    titleKey: 'Tools.RecentFiles',
    path: '/tools/recent-file',
    icon: <ScheduleRounded />,
  },
  fileViewer: {
    titleKey: 'Tools.FileViewer',
    path: '/tools/file-viewer',
    icon: <TopicRounded />,
  },
  repeatFile: {
    titleKey: 'Tools.RepeatFileAnalyzer',
    path: '/tools/repeat-file',
    icon: <CalculateRounded />,
  },
  dislikeFile: {
    titleKey: 'Tools.DislikeFileList',
    path: '/tools/dislike-list',
    icon: <ThumbDownAltRounded />,
  },
};

const getRouteByKeys = (keys: string[]) => {
  return (t?: TFunction) =>
    [...Object.values(pick(ROUTES, keys))].map(it => ({
      ...it,
      title: t?.(it.titleKey),
    }));
};

// 工具页跳转选项
export const getToolsRoutes = getRouteByKeys([
  'recentFiles',
  'fileViewer',
  'repeatFile',
  'dislikeFile',
]);

// header 跳转选项
export const getHeaderRoutes = getRouteByKeys(['home', 'fileViewer', 'recentFiles', 'tools']);
