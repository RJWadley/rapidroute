import React, { useEffect, useRef } from "react"

import gsap from "gsap"
import styled from "styled-components"

import { getLocal } from "utils/localUtils"
import usePlayerHead from "utils/usePlayerHead"

import RoundButton from "../RoundButton"
import DarkModeSetting from "./DarkModeSetting"

const circlePosition = "at calc(100% - 35px) 35px"

export default function Settings() {
  const player = getLocal("selectedPlayer")?.toString()
  const playerHead = usePlayerHead(player ?? "")
  const [openButton, setOpenButton] = React.useState<HTMLButtonElement | null>(
    null
  )
  const [open, setOpen] = React.useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.to(openButton, { opacity: 1, duration: 0.5 })
  }, [openButton])

  useEffect(() => {
    gsap.to(menu.current, {
      clipPath: open
        ? `circle(200% ${circlePosition})`
        : `circle(0% ${circlePosition})`,
      ease: open ? "power4.in" : "power4.out",
      duration: .3,
    })
  }, [open])

  return playerHead ? (
    <>
      <Open ref={el => setOpenButton(el)} onClick={() => setOpen(!open)}>
        <PlayerHead src={playerHead} alt="your player head" />
      </Open>
      <Menu ref={menu}>
        <Heading>
          <div>Settings</div>
          <CloseButton onClick={() => setOpen(!open)}>close</CloseButton>
        </Heading>
        <DarkModeSetting />
      </Menu>
    </>
  ) : null
}

const Open = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  opacity: 0;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 10px;
`

const PlayerHead = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`

const Menu = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 350px;
  max-width: calc(100vw - 20px);
  background: var(--default-card-background);
  z-index: 100;
  border-radius: 30px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  padding: 30px;
  clip-path: circle(0% ${circlePosition});
  display: grid;
  gap: 20px;
`

const Heading = styled.h1`
  font-size: var(--large);
  font-weight: 700;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
`

const CloseButton = styled(RoundButton)`
  width: 50px;
  height: 50px;
  border-radius: 15px;
  font-size: var(--large);
`
