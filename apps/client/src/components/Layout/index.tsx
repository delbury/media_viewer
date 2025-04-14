'use client';

import { NotificationsProvider } from '@toolpad/core/useNotifications';
import MediaViewerProvider from '../MediaViewerProvider';

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <NotificationsProvider>
      <MediaViewerProvider>{children}</MediaViewerProvider>
    </NotificationsProvider>
  );
};

export default Layout;
