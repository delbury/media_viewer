import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(__dirname, process.env.NODE_ENV?.trim() === 'dev' ? '../.env.dev' : '../.env'),
});
