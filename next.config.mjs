/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 90 keeps app screenshots sharp inside the phone frame
    qualities: [75, 90],
  },
};

export default nextConfig;
