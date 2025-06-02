'use client';

import { NOTIFICATION_Z_INDEX } from '#/style/constant';
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import CancelAreaProvider from '../CancelAreaProvider';
import ConfirmDialogProvider from '../ConfirmDialogProvider';
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
            zIndex: NOTIFICATION_Z_INDEX,
          },
        },
      }}
    >
      <ConfirmDialogProvider>
        <CancelAreaProvider>
          <MediaViewerProvider>{children}</MediaViewerProvider>
        </CancelAreaProvider>
      </ConfirmDialogProvider>
    </NotificationsProvider>
  );
};

export default Layout;
