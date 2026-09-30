import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	reactCompiler: {
		panicThreshold: "all_errors",
	},
  allowedDevOrigins: ['computer-wsl'],
  
	logging: {
		incomingRequests: false, // next + trpc = lots of useless spam
	},
}

export default nextConfig
