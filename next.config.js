/** @type {import('next').NextConfig} */
   const nextConfig = {
     // Remove the experimental section with appDir
     async rewrites() {
       return [
         {
           source: '/api/:path*',
           destination: '/api/:path*',
         },
       ]
     },
     // Disable type checking during production build
     typescript: {
       ignoreBuildErrors: true,
     },
     // Disable ESLint during production build
     eslint: {
       ignoreDuringBuilds: true,
     },
   }

   module.exports = nextConfig