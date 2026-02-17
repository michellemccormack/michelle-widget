/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/widget.js',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET' },
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
      ],
    },
  ],
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/widget.js', destination: '/api/widget-bundle' },
      ],
    };
  },
};

module.exports = nextConfig;
