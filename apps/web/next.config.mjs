/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@samarth-mess/types", "@samarth-mess/validation", "@samarth-mess/shared"]
};

export default nextConfig;
