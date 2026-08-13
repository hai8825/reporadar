/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma 7's generated client + pg driver must stay external to the server
  // bundle (native deps / dynamic requires don't survive webpack bundling).
  // Graduated out of `experimental` in Next 15.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
