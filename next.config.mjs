import withLinaria from "next-with-linaria"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./app/env.mjs")

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
    webpackConfig.module?.rules?.push({
      test: /\.node$/,
      use: "ignore-loader",
    })

    return webpackConfig
  },
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
}

export default withLinaria(config)
