import { useEffect, useRef, useState } from "react"

import gsap from "gsap"
import { useLocation } from "react-use"
import styled from "styled-components"

import RoundButton from "components/RoundButton"
import UniversalLink from "utils/Loader/UniversalLink"
import { getLocal } from "utils/localUtils"
import media from "utils/media"
import usePlayerHead from "utils/usePlayerHead"

import DarkModeSetting from "./DarkModeSetting"
import RateSetting from "./RateSetting"
import SelectedPlayerSetting from "./SelectedPlayerSetting"
import VoiceSetting from "./VoiceSetting"

const circlePosition = "at calc(100% - 35px) 35px"

export default function Settings() {
  const player = getLocal("selectedPlayer")?.toString()
  const playerHead = usePlayerHead(player ?? "")
  const [openButton, setOpenButton] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    gsap.to(menu.current, {
      clipPath: open
        ? `circle(200% ${circlePosition})`
        : `circle(0% ${circlePosition})`,
      ease: open ? "power4.in" : "power4.out",
      duration: 0.3,
    })
    gsap.to(openButton, {
      autoAlpha: open ? 0 : 1,
    })
    gsap.set(menu.current, {
      autoAlpha: open ? 1 : 0,
      delay: open ? 0 : 0.3,
    })
  }, [open, openButton])

  /**
   * handle click outside of menu
   */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        open &&
        e.target instanceof HTMLElement &&
        !menu.current?.contains(e.target) &&
        !openButton?.contains(e.target)
      ) {
        setOpen(false)
      }
    }

    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [open, openButton])

  const linkDestination = location.pathname === "/" ? "/map" : "/"
  const viewName = location.pathname === "/" ? "Map" : "List"

  return playerHead ? (
    <>
      <Open ref={el => setOpenButton(el)} onClick={() => setOpen(!open)}>
        <PlayerHead
          src={playerHead}
          alt="your player head"
          onLoad={e => {
            gsap.to(e.target, {
              autoAlpha: 1,
              delay: 0.5,
            })
          }}
        />
      </Open>
      <Menu ref={menu}>
        <Heading>
          <div>Settings</div>
          <CloseButton onClick={() => setOpen(!open)}>close</CloseButton>
        </Heading>
        <SelectedPlayerSetting />
        <DarkModeSetting />
        <VoiceSetting />
        <RateSetting />
        <SwitchView to={linkDestination} transition="slide">
          Switch to {viewName} View{viewName === "Map" ? " (Beta)" : ""}
        </SwitchView>
      </Menu>
    </>
  ) : null
}

const Open = styled.button`
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 10px;
`

const PlayerHead = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  opacity: 0;
`

const Menu = styled.div`
  position: absolute;
  visibility: hidden;
  top: 10px;
  right: 10px;
  max-width: calc(100vw - 20px);
  min-width: 450px;
  background: var(--default-card-background);
  z-index: 100;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  padding: 30px;
  border-radius: 35px 35px 50px 50px;
  clip-path: circle(0% ${circlePosition});
  display: grid;
  gap: 20px;

  @media ${media.mobile} {
    padding: 20px;
    border-radius: 30px 30px 40px 40px;
    min-width: 0;
    width: 450px;
  }
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

const SwitchView = styled(UniversalLink)`
  font-size: var(--small);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  font-weight: bold;
  background-color: var(--dark-background);
`
