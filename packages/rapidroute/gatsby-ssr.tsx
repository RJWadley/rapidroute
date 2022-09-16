import "the-new-css-reset/css/reset.css"
import React from "react"

import Providers from "components/Providers"

export const wrapRootElement = ({ element }: { element: React.ReactNode }) => {
  return <Providers>{element}</Providers>
}

export const wrapPageElement = ({ element }: { element: React.ReactNode }) => {
  return element
}
