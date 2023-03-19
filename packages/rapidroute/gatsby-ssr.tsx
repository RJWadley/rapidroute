import "the-new-css-reset/css/reset.css"
import { ReactNode } from "react"

import Layout from "components/Layout"
import PageTransition from "components/PageTransition"
import Providers from "components/Providers"

export const wrapRootElement = ({ element }: { element: ReactNode }) => {
  return <Providers>{element}</Providers>
}

export const wrapPageElement = ({ element }: { element: ReactNode }) => {
  return (
    <Layout>
      <PageTransition />
      {element}
    </Layout>
  )
}
