/** @type {import('next').NextConfig} */
const backendUrl = (process.env.BACKEND_URL || "http://127.0.0.1:8000").replace("localhost", "127.0.0.1");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/bookings/:path*',
        destination: `${backendUrl}/api/bookings/:path*`,
      },
      {
        source: '/api/technicians/:path*',
        destination: `${backendUrl}/api/technicians/:path*`,
      },
      {
        source: '/api/coupons/validate/:path*',
        destination: `${backendUrl}/api/coupons/validate/:path*`,
      },
      {
        source: '/api/complaints/:path*',
        destination: `${backendUrl}/api/complaints/:path*`,
      },
      {
        source: '/api/pricing-factors/:path*',
        destination: `${backendUrl}/api/pricing-factors/:path*`,
      },
      {
        source: '/admin/:path*',
        destination: `${backendUrl}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
