import React, { useContext, useRef } from "react"

import { RoutingContext } from "components/Providers/RoutingContext"
import RoundButton from "components/RoundButton"
import styled from "styled-components"
import gsap from "gsap"
import media from "utils/media"
import useMedia from "utils/useMedia"

export default function SwapButton() {
  const { from, to, setFrom, setTo } = useContext(RoutingContext)
  const swapRef = useRef<HTMLDivElement>(null)
  const isMobile = useMedia(`(max-width: ${media.small}px)`)

  const handleClick = () => {
    const fromEl = document.getElementById("from")
    const toEl = document.getElementById("to")

    const duration = 0.5
    const mobile = window.innerWidth < media.small

    gsap.to(fromEl, {
      duration,
      opacity: 0,
      xPercent: mobile ? 0 : 100,
      yPercent: mobile ? 100 : 0,
      ease: "power2.in",
      onComplete: () => {
        setFrom(to)
        setTo(from)
        gsap.to(fromEl, {
          duration,
          opacity: 1,
          xPercent: 0,
          yPercent: 0,
          ease: "power2.out",
        })
      },
    })

    gsap.to(toEl, {
      duration,
      opacity: 0,
      xPercent: mobile ? 0 : -100,
      yPercent: mobile ? -100 : 0,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(toEl, {
          duration,
          opacity: 1,
          xPercent: 0,
          yPercent: 0,
          ease: "power2.out",
        })
      },
    })

    gsap.to(swapRef.current, {
      rotate: "+=180",
      onUpdate: () => {
        // clamp to intervals of 180
        const rotation = gsap.getProperty(swapRef.current, "rotate")
        if (rotation >= 360) {
          gsap.getTweensOf(swapRef.current).forEach(t => t.kill())
          gsap.set(swapRef.current, { rotate: 0 })
        }
      },
    })
  }

  return (
    <StyledButton onClick={handleClick}>
      <div ref={swapRef}>{isMobile ? "swap_vert" : "swap_horiz"}</div>
    </StyledButton>
  )
}

const StyledButton = styled(RoundButton)`
  grid-area: swap;
  z-index: 10;
`
