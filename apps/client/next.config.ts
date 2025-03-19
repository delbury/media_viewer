import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4002/:path*',
      },
    ];
  },
  compiler: {
    emotion: true,
    styledComponents: true,
  },
};

export default withNextIntl(nextConfig);
