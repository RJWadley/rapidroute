import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	reactCompiler: {
		panicThreshold: "all_errors",
	},

	logging: {
		incomingRequests: false, // next + trpc = lots of useless spam
	},
}

export default nextConfig
