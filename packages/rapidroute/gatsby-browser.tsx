/* TODO  ssr-friendly/no-dom-globals-in-module-scope */
import "the-new-css-reset/css/reset.css"
import "hacktimer/HackTimer"

import PageTransition from "components/PageTransition"
import Providers from "components/Providers"
import gsap from "gsap"
import Flip from "gsap/Flip"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ReactNode } from "react"

gsap.registerPlugin(ScrollTrigger, Flip)

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

gsap.config({
  nullTargetWarn: false,
})
