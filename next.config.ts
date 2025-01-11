import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
	},
	reactStrictMode: false,
}

export default nextConfig
