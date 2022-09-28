import React from "react"

import { graphql, useStaticQuery } from "gatsby"

type SEOProps = {
  title?: string
  description?: string
  pathname?: string
  creator?: string
  image?: string
}

export default function SEO({
  title = undefined,
  description = undefined,
  pathname = undefined,
  creator = "",
  image = undefined,
}: SEOProps) {
  const {
    title: defaultTitle,
    description: defaultDescription,
    image: defaultImage,
    siteUrl,
  } = useSiteMetadata()

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: image || defaultImage,
    url: `${siteUrl}/${pathname || ``}`,
    creator,
  }

  return (
    <>
      {/* basic head elements */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, minimal-ui"
      />

      {/* google fonts (Inter and Material Symbols Outlined) */}
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      {/* twitter seo */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={seo.creator} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* og seo */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
    </>
  )
}

export const useSiteMetadata = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          image
          siteUrl
        }
      }
    }
  `)
  return data.site.siteMetadata
}
