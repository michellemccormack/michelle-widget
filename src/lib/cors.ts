import { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://michellemccormack.com',
  'https://www.michellemccormack.com',
  'http://localhost:3000', // for local testing
];

export function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '')
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}
