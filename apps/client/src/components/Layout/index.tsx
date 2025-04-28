'use client';

import { NotificationsProvider } from '@toolpad/core/useNotifications';
import CancelAreaProvider from '../CancelAreaProvider';
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
      <CancelAreaProvider>
        <MediaViewerProvider>{children}</MediaViewerProvider>
      </CancelAreaProvider>
    </NotificationsProvider>
  );
};

export default Layout;
