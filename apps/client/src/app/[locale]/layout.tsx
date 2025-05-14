import Header from '#/components/Header';
import Layout from '#/components/Layout';
import { routing } from '#/i18n/routing';
import { HEADER_HEIGHT } from '#/style/constant';
import { theme } from '#/style/theme';
import { Theme } from '@emotion/react';
import { Box } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { SxProps, ThemeProvider } from '@mui/material/styles';
import classNames from 'classnames';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import '#/style/globals.scss';
import '#/style/override.scss';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Media Viewer',
  description: 'for view media files',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};

const CONTAINER_SX: SxProps<Theme> = {
  padding: '16px',
  height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={classNames(geistSans.variable, geistMono.variable)}>
        <NextIntlClientProvider messages={messages}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <ErrorBoundary fallback={<Box>Something went wrong</Box>}>
                <Layout>
                  <Header />
                  <Box sx={CONTAINER_SX}>{children}</Box>
                </Layout>
              </ErrorBoundary>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
