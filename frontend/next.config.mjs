/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/bookings/track/:path*',
        destination: 'http://localhost:8000/api/bookings/track/:path*',
      },
      {
        source: '/api/technicians/:path*',
        destination: 'http://localhost:8000/api/technicians/:path*',
      },
      {
        source: '/api/coupons/validate/:path*',
        destination: 'http://localhost:8000/api/coupons/validate/:path*',
      },
      {
        source: '/api/complaints/:path*',
        destination: 'http://localhost:8000/api/complaints/:path*',
      },
      {
        source: '/api/pricing-factors/:path*',
        destination: 'http://localhost:8000/api/pricing-factors/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:8000/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
