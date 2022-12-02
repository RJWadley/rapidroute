import path from "path"

import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
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
    "gatsby-plugin-styled-components",
    "gatsby-plugin-sitemap",
    "gatsby-plugin-netlify",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-offline",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "MRT RapidRoute",
        short_name: "RapidRoute",
        start_url: "/",
        display: "standalone",
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
      resolve: "gatsby-plugin-root-import",
      options: {
        src: path.resolve("src"),
      },
    },
    {
      resolve: "gatsby-plugin-layout",
      options: {
        component: path.resolve("./src/components/Providers/index.tsx"),
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: path.join(__dirname, "src", "images"),
      },
    },
    {
      resolve: "gatsby-plugin-svgr",
      options: {
        prettier: true,
        svgo: true,
        memo: true,
        ref: true,
        svgoConfig: {
          plugins: [
            {
              name: "removeViewBox",
              active: false,
            },
            {
              name: "removeDimensions",
              active: true,
            },
            {
              name: "removeRasterImages",
              active: true,
            },
            {
              name: "reusePaths",
              active: true,
            },
            {
              name: "cleanupIDs",
              active: false,
            },
            {
              name: "prefixIds",
              active: false,
            },
            {
              name: "removeUselessDefs",
              active: true,
            },
          ],
        },
      },
    },
    {
      resolve: "gatsby-plugin-tsconfig-paths",
      options: {
        configFile: `${__dirname}/tsconfig.json`,
        silent: true,
      },
    },
  ],
}

export default config
