module.exports = {
  apps: [
    {
      name: 'client',
      cwd: './apps/client',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      watch: false,
      // interpreter: 'none',
      // env: {
      //   NODE_ENV: 'production',
      // },
    },
    {
      name: 'server',
      cwd: './apps/server',
      script: 'node',
      args: '--import tsx ./main.ts',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: '3005',
      },
    },
  ],
};
