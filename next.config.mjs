import { withYak } from "next-yak/withYak"

/** @type {import("next").NextConfig} */
const config = {
	// experimental: {
	// 	turbo: {
	// 		rules: {
	// 			"*.svg": {
	// 				loaders: ["@svgr/webpack"],
	// 				as: "*.js",
	// 			},
	// 		},
	// 	},
	// },

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
}

export default withYak(config)
