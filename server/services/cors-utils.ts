import { Response } from 'express';

const ALLOWED_ORIGIN_LIST = [
  'https://final-seo-tool-a3yfd06px-nitros-projects-deeabea9.vercel.app',
  'http://localhost:3000',
];

const vercelPreviewRegex = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGIN_LIST.includes(origin) || vercelPreviewRegex.test(origin);
}

export function addCorsHeaders(res: Response, origin: string | undefined): void {
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}