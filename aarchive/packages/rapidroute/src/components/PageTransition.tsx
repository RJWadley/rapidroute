import { ReactComponent as Logo } from "assets/images/global/RapidRouteLogo.svg"
import gsap from "gsap"
import { useEffect, useRef } from "react"
import styled from "styled-components"
import {
  registerTransition,
  unregisterTransition,
} from "utils/Loader/TransitionUtils"

export default function PageTransition() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const duration = 0.5

  const fadeIn = () => {
    gsap.to(wrapperRef.current, {
      autoAlpha: 1,
      ease: "power1.out",
      duration,
    })
  }

  const fadeOut = () => {
    gsap.to(wrapperRef.current, {
      autoAlpha: 0,
      duration,
      ease: "power1.in",
    })
  }

  useEffect(() => {
    registerTransition("slide", {
      in: fadeIn,
      out: fadeOut,
      inDuration: duration,
      outDuration: duration,
    })

    return () => {
      unregisterTransition("slide", [fadeIn, fadeOut])
    }
  }, [])

  return (
    <Wrapper ref={wrapperRef}>
      <StyledLogo />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: var(--default-card-background);
  z-index: 1000;
  pointer-events: none;
  display: grid;
  place-items: center;
  visibility: hidden;
`

const StyledLogo = styled(Logo)`
  width: 200px;
  filter: drop-shadow(0 0 10px rgb(0 0 0 / 20%));
`
