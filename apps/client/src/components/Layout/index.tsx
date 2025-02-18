'use client';

import { NotificationsProvider } from '@toolpad/core/useNotifications';

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <NotificationsProvider>{children}</NotificationsProvider>;
};

export default Layout;
