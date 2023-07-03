import "the-new-css-reset/css/reset.css"

import PageTransition from "components/PageTransition"
import Providers from "components/Providers"
import { ReactNode } from "react"

export const wrapRootElement = ({ element }: { element: ReactNode }) => {
  return <Providers>{element}</Providers>
}

export const wrapPageElement = ({ element }: { element: ReactNode }) => {
  return (
    <>
      <PageTransition />
      {element}
    </>
  )
}
