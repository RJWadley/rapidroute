import { useEffect, useRef } from "react"

import gsap from "gsap"
import { ReactComponent as Logo } from "assets/images/global/RapidRouteLogo.svg"
import styled from "styled-components"

import {
  registerTransition,
  unregisterTransition,
} from "utils/Loader/TransitionUtils"

export default function PageTransition() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)

  const duration = 0.5

  const slideIn = () => {
    gsap.fromTo(wrapperRef.current, {
        y: "-110vh",
        borderRadius: "500px",
      },
      {
        borderRadius: 0,
        y: "0vw",
        ease: "power1.out",
        duration,
      })

    gsap.fromTo(logoRef.current, {
        y: "110vh",
      },
      {
        y: "0vw",
        duration,
        ease: "power1.out",
      })
  }

  const slideOut = () => {
    gsap.fromTo(wrapperRef.current, {
        y: "0vw",
        borderRadius: 0,
      },
      {
        duration,
        borderRadius: "500px",
        y: "110vh",
        ease: "power1.in",
      })

    gsap.fromTo(logoRef.current, {
        y: "0vw",
      },
      {
        y: "-110vh",

        duration,
        ease: "power1.in",
      })
  }

  useEffect(() => {
    registerTransition("slide", {
      in: slideIn,
      out: slideOut,
      inDuration: duration,
      outDuration: duration,
    })

    return () => {
      unregisterTransition("slide", [slideIn, slideOut])
    }
  }, [])

  return (
    <Wrapper ref={wrapperRef}>
      <StyledLogo ref={logoRef} />
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
  transform: translateY(-100vh);
  overflow: hidden;
`

const StyledLogo = styled(Logo)`
  width: 200px;
  filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.2));
`
