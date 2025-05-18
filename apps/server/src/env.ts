import dotenv from 'dotenv';
import path from 'node:path';

const env = process.env.NODE_ENV?.trim();

dotenv.config({
  path: path.resolve(__dirname, `../.env.${env}`),
});
