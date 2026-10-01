import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	serverExternalPackages: ["node-wreq"],
	outputFileTracingIncludes: {
		// The native loader chooses its platform package at runtime.
		"/*": [
			"./node_modules/@node-wreq/*/*.node",
			"./node_modules/@node-wreq/*/package.json",
			"./node_modules/.pnpm/node-wreq@*/node_modules/@node-wreq/*/*.node",
			"./node_modules/.pnpm/node-wreq@*/node_modules/@node-wreq/*/package.json",
		],
	},
	reactCompiler: {
		panicThreshold: "all_errors",
	},
	allowedDevOrigins: ["computer-wsl"],

	logging: {
		incomingRequests: false, // next + trpc = lots of useless spam
	},
}

export default nextConfig
