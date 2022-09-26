import "the-new-css-reset/css/reset.css"
import React, { ReactNode } from "react"

import Providers from "components/Providers"

export const wrapRootElement = ({ element }: { element: ReactNode }) => {
  return <Providers>{element}</Providers>
}

export const wrapPageElement = ({ element }: { element: ReactNode }) => {
  return element
}
