/* eslint-disable ssr-friendly/no-dom-globals-in-module-scope */
import "the-new-css-reset/css/reset.css"
import React, { ReactNode } from "react"
import "hacktimer/HackTimer"

import gsap from "gsap"
import Flip from "gsap/Flip"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import Providers from "components/Providers"

gsap.registerPlugin(ScrollTrigger, Flip)

export const wrapRootElement = ({ element }: { element: ReactNode }) => {
  return <Providers>{element}</Providers>
}

export const wrapPageElement = ({ element }: { element: ReactNode }) => {
  return element
}

// disable gsap null warnings when not on localhost
if (!window.location.hostname.includes("localhost")) {
  gsap.config({
    nullTargetWarn: false,
  })
}
