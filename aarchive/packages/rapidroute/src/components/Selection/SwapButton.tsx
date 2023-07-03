import { RoutingContext } from "components/Providers/RoutingContext"
import RoundButton from "components/RoundButton"
import gsap from "gsap"
import { useContext, useRef } from "react"
import styled from "styled-components"
import media from "utils/media"
import useMedia from "utils/useMedia"

/**
 * displays a button that swaps the to and from locations and animates the change
 */
export default function SwapButton() {
  const { from, to, setFrom, setTo } = useContext(RoutingContext)
  const swapRef = useRef<HTMLDivElement>(null)
  const isMobile = useMedia(media.mobile)
  const clickCount = useRef<number>(0)

  /**
   * swaps the from and to locations and animates the change
   * note that we need to track any consecutive clicks to prevent
   * the state from changing at the wrong time
   */
  const handleClick = () => {
    const fromEl = document.querySelector("#from")
    const toEl = document.querySelector("#to")
    const thisId = clickCount.current + 1
    clickCount.current = thisId
    const duration = 0.5

    gsap.to(fromEl, {
      duration,
      opacity: 0,
      xPercent: isMobile ? 0 : 100,
      yPercent: isMobile ? 100 : 0,
      ease: "power2.in",
      onComplete: () => {
        if (clickCount.current === thisId) {
          setFrom(to)
          setTo(from)
          gsap.to(fromEl, {
            duration,
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            ease: "power2.out",
          })
        }
      },
    })

    gsap.to(toEl, {
      duration,
      opacity: 0,
      xPercent: isMobile ? 0 : -100,
      yPercent: isMobile ? -100 : 0,
      ease: "power2.in",
      onComplete: () => {
        if (clickCount.current === thisId)
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
      rotate: 180 * clickCount.current,
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