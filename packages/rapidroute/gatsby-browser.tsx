/* eslint-disable ssr-friendly/no-dom-globals-in-module-scope */
import "the-new-css-reset/css/reset.css"
import { ReactNode } from "react"
import "hacktimer/HackTimer"

import gsap from "gsap"
import Flip from "gsap/Flip"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import PageTransition from "components/PageTransition"
import Providers from "components/Providers"

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
