import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
	},

	logging: {
		incomingRequests: false, // next + trpc = lots of useless spam
	},
}

export default nextConfig
