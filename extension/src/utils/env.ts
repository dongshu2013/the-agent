import { Env } from '../types/index';

if (!process.env.PLASMO_PUBLIC_BACKEND_URL) {
  throw new Error('PLASMO_PUBLIC_BACKEND_URL is not set');
}

if (!process.env.PLASMO_PUBLIC_WEB_URL) {
  throw new Error('PLASMO_PUBLIC_WEB_URL is not set');
}

export const env: Env = {
  BACKEND_URL: process.env.PLASMO_PUBLIC_BACKEND_URL,
  WEB_URL: process.env.PLASMO_PUBLIC_WEB_URL,
};
