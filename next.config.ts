import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	logging: {
		incomingRequests: false,
	},
	experimental: {
		reactCompiler: true,
	},
	reactStrictMode: false,
}

export default nextConfig
