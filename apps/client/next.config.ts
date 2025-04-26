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
    // styledComponents: true,
  },
  // 严格模式下，在开发环境下，组件会挂载两次
  reactStrictMode: false,
  images: {},
  // 禁用 dev 下的工具浮窗
  devIndicators: false,
};

export default withNextIntl(nextConfig);
