import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  jsxRuntime: "automatic",
  siteMetadata: {
    title: "RapidRoute",
    description: "A route finder for the Minecart Rapid Transit Server",
    siteUrl: "https://www.mrtrapidroute.com",
    image: "https://example.com/logo.png",
  },
  graphqlTypegen: {
    generateOnBuild: true,
    typesOutputPath: "src/types/gatsby-types.d.ts",
  },
  plugins: [
    "gatsby-plugin-sitemap",
    "gatsby-plugin-netlify",
    "gatsby-plugin-offline",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "MRT RapidRoute",
        short_name: "RapidRoute",
        start_url: "/",
        display: "standalone",
        display_override: ["window-controls-overlay"],
        background_color: "#111111",
        theme_color: "#111111",
        icons: [
          {
            src: "/icons/Maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/Circle.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/Maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/Circle-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-svgr",
      options: {
        prettier: true,
        svgo: true,
        svgoConfig: {
          plugins: [
            "removeViewBox",
            "removeDimensions",
            "removeRasterImages",
            "reusePaths",
            "removeUselessDefs",
            {
              name: "cleanupIDs",
              active: false,
            },
            {
              name: "prefixIds",
              active: false,
            },
            {
              name: "collapseGroups",
              active: false,
            },
          ],
        },
      },
    },
    {
      resolve: "gatsby-plugin-tsconfig-paths",
      options: {
        configFile: `./tsconfig.json`,
        silent: true,
      },
    },
    "gatsby-plugin-styled-components",
  ],
}

export default config
