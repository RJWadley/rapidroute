import gsap from "gsap"
import { useEffect, useState } from "react"

import { isColorLight } from "./functions"

export default function useAdpativeColor(
  element: Element | ArrayLike<Element> | undefined | null,
  lightStyles: gsap.TweenVars,
  darkStyles: gsap.TweenVars
) {
  const [isLight, setIsLight] = useState(true)

  useEffect(() => {
    const updateStyles = () => {
      const targetEl = element instanceof Element ? element : element?.[0]

      if (targetEl) {
        // get the element currently under the logo
        const position = targetEl.getBoundingClientRect()
        const elements = document.elementsFromPoint(
          position.x + position.width / 2,
          position.y + position.height / 2
        )
        const header = document.querySelector("header")

        if (!header) return

        // find the first element not in the header and has a background color
        const backgroundEl = elements.find(el => {
          return (
            !header.contains(el) &&
            window.getComputedStyle(el).getPropertyValue("background-color") !==
              "rgba(0, 0, 0, 0)"
          )
        })

        if (backgroundEl) {
          // get the background color of the element
          const color = window
            .getComputedStyle(backgroundEl)
            .getPropertyValue("background-color")

          if (isColorLight(color)) {
            setIsLight(true)
          } else {
            setIsLight(false)
          }
        }
      }
    }

    const interval = setInterval(updateStyles, 250)

    return () => clearInterval(interval)
  }, [darkStyles, element, lightStyles])

  useEffect(() => {
    if (!element) return
    if (isLight) {
      gsap.to(element, {
        ...lightStyles,
        duration: 0.2,
        ease: "power3.inOut",
      })
    } else {
      gsap.to(element, {
        ...darkStyles,
        duration: 0.2,
        ease: "power3.inOut",
      })
    }
  }, [darkStyles, element, isLight, lightStyles])
}
