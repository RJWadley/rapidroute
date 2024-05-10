import withLinaria from "next-with-linaria"
import { withYak } from "next-yak/withYak"

/** @type {import("next").NextConfig} */
const config = {
	/**
	 * @param {import("webpack").Configuration} webpackConfig
	 * @returns {import("webpack").Configuration}
	 */
	webpack(webpackConfig) {
		webpackConfig.module?.rules?.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
		})

		return webpackConfig
	},

	/**
	 * react strict mode breaks pixi stuff :(
	 */
	reactStrictMode: false,
	experimental: {
		typedRoutes: true,
	},
}

export default withYak(withLinaria(config))
