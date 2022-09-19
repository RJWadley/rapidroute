/* eslint-disable ssr-friendly/no-dom-globals-in-module-scope */
/* eslint-disable no-console */
import "the-new-css-reset/css/reset.css"
import React from "react"

import gsap from "gsap"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import Providers from "components/Providers"
import invertLightness from "utils/invertLightness"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export const wrapRootElement = ({ element }: { element: React.ReactNode }) => {
  return <Providers>{element}</Providers>
}

export const wrapPageElement = ({ element }: { element: React.ReactNode }) => {
  return element
}

console.log(invertLightness("#00ffff"))