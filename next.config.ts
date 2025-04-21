import { serverSiteURL } from "./app/utils/siteURL/determine"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_DEPLOY_URL: serverSiteURL,
	},

	experimental: {
		reactCompiler: true,
	},

	logging: {
		incomingRequests: false, // next + trpc = lots of useless spam
	},
}

export default nextConfig
