'use client';

import { NotificationsProvider } from '@toolpad/core/useNotifications';
import MediaViewerProvider from '../MediaViewerProvider';

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <NotificationsProvider
      slotProps={{
        snackbar: {
          sx: {
            zIndex: 4000,
            top: '8px',
            bottom: 'unset',
          },
        },
      }}
    >
      <MediaViewerProvider>{children}</MediaViewerProvider>
    </NotificationsProvider>
  );
};

export default Layout;
