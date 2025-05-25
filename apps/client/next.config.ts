import { REQUEST_TIMEOUT } from '#pkgs/tools/constant';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const PORT = process.env.API_PORT || 4002;

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '',
  distDir: process.env.NODE_ENV === 'production' ? 'dist' : '.next',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:${PORT}/:path*`,
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
  experimental: {
    proxyTimeout: REQUEST_TIMEOUT,
  },
  webpack: config => {
    // 禁用 webpack 缓存以解决构建问题
    config.cache = false;
    return config;
  },
};

export default withNextIntl(nextConfig);
