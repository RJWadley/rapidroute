import React, { useEffect, useRef } from "react"

import gsap from "gsap"
import styled from "styled-components"

import { triggerRecalculation } from "components/Providers/DarkMode"
import { getLocal, setLocal } from "utils/localUtils"

type Mode = "dark" | "light" | "system"

export default function DarkModeSetting() {
  const [mode, setMode] = React.useState<Mode>("system")
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
      x = 8
    } else if (mode === "system") {
      offset = 200
      x = 16
    }

    gsap.to(overlay.current, {
      xPercent: offset,
      x,
      duration: 1,
      ease: "elastic.out(0.7, 0.5)",
    })

    const ctx = gsap.context(() => {
      gsap.set("*", {
        transition: "background-color 0.5s ease, color 0.1s ease",
      })
    })
    gsap.delayedCall(1, () => ctx.revert())

    return () => ctx.revert()
  }, [mode])

  return (
    <Wrapper>
      <Button onClick={() => updateMode("dark")}>Dark</Button>
      <Button onClick={() => updateMode("light")}>Light</Button>
      <Button onClick={() => updateMode("system")}>System</Button>
      <Overlay ref={overlay} />
    </Wrapper>
  )
}

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
  top: 4px;
  left: 4px;
  width: calc(calc(100% / 3) - 8px);
  height: calc(100% - 8px);
  background-color: var(--dark-background);
  z-index: 0;
  border-radius: 18px;
`
