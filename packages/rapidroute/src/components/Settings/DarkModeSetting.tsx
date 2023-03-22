import { useEffect, useRef, useState } from "react"

import gsap from "gsap"
import styled, { createGlobalStyle, css } from "styled-components"

import { triggerRecalculation } from "components/Providers/DarkMode"
import { getLocal, setLocal } from "utils/localUtils"

type Mode = "dark" | "light" | "system"

const PAD = 10

export default function DarkModeSetting() {
  const [mode, setMode] = useState<Mode>("system")
  const overlay = useRef<HTMLDivElement>(null)

  const updateMode = (newMode: Mode) => {
    setLocal("darkMode", newMode)
    setMode(newMode)
    triggerRecalculation()
  }

  useEffect(() => {
    const localMode = getLocal("darkMode")
    setMode(localMode ?? "system")
  }, [])

  useEffect(() => {
    let offset = 0
    let x = 0

    if (mode === "light") {
      offset = 100
      x = PAD * 2
    } else if (mode === "system") {
      offset = 200
      x = PAD * 4
    }

    gsap.to(overlay.current, {
      xPercent: offset,
      x,
      duration: 1,
      ease: "elastic.out(0.7, 0.5)",
    })

    document.documentElement.classList.add("in-transition")
    const call = gsap.delayedCall(1, () => {
      document.documentElement.classList.remove("in-transition")
    })

    return () => {
      call.kill()
    }
  }, [mode])

  return (
    <Wrapper>
      <Button onClick={() => updateMode("dark")}>Dark</Button>
      <Button onClick={() => updateMode("light")}>Light</Button>
      <Button onClick={() => updateMode("system")}>System</Button>
      <Overlay ref={overlay} />
      <TransitionStyle />
    </Wrapper>
  )
}

const TransitionStyle = createGlobalStyle`${css`
  .in-transition {
    * {
      transition: background-color 0.5s ease, color 0.1s ease !important;
    }
  }
`}`

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  position: relative;
  background: var(--mid-background);
  border-radius: 20px;
`

const Button = styled.button`
  cursor: pointer;
  text-align: center;
  padding: 20px 0;
  z-index: 1;
`

const Overlay = styled.div`
  pointer-events: none;
  position: absolute;
  top: ${PAD}px;
  left: ${PAD}px;
  width: calc(calc(100% / 3) - ${PAD * 2}px);
  height: calc(100% - ${PAD * 2}px);
  background-color: var(--dark-background);
  z-index: 0;
  border-radius: 10px;
`
