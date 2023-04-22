import RoundButton from "components/RoundButton"
import gsap from "gsap"
import { useEffect, useRef, useState } from "react"
import { useClickAway, useLocation } from "react-use"
import styled from "styled-components"
import UniversalLink from "utils/Loader/UniversalLink"
import { getLocal } from "utils/localUtils"
import media from "utils/media"
import usePlayerHead from "utils/usePlayerHead"

import DarkModeSetting from "./DarkModeSetting"
import RateSetting from "./RateSetting"
import SelectedPlayerSetting from "./SelectedPlayerSetting"
import VoiceSetting from "./VoiceSetting"

export default function Settings() {
  const player = getLocal("selectedPlayer")?.toString()
  const playerHead = usePlayerHead(player)
  const location = useLocation()
  const [viewName, setViewName] = useState("Map")
  const linkDestination = viewName === "Map" ? "/map" : "/"
  useEffect(() => {
    setViewName(location.pathname === "/" ? "Map" : "List")
  }, [location.pathname])

  const [openButton, setOpenButton] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)

  const menu = useRef<HTMLDivElement>(null)
  const playerHeadRef = useRef<HTMLImageElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.to(menu.current, {
      yPercent: open ? 0 : -100,
      y: open ? 0 : -100,
      duration: open ? 1 : 0.5,
      ease: open ? "elastic.out(0.8, 0.8)" : "power2.in",
      willChange: "transform",
    })
    gsap.to(openButton, {
      autoAlpha: open ? 0 : 1,
      duration: 0.1,
    })
  }, [open, openButton])

  /**
   * handle click outside of menu
   */
  useClickAway(wrapperRef, () => {
    setOpen(false)
  })

  /**
   * fade in player head
   */
  const playerHeadLoad = () => {
    gsap.to(playerHeadRef.current, {
      autoAlpha: 1,
      delay: 0.5,
    })
  }

  // if player head is already loaded, fade it in
  // otherwise, wait for load event
  useEffect(() => {
    if (playerHeadRef.current?.complete) {
      playerHeadLoad()
    }
  }, [])

  return (
    <div ref={wrapperRef}>
      <Open ref={el => setOpenButton(el)} onClick={() => setOpen(!open)}>
        <PlayerHead
          src={playerHead}
          ref={playerHeadRef}
          alt="your player head"
          onLoad={playerHeadLoad}
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
    </div>
  )
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
  top: 10px;
  right: 10px;
  max-width: calc(100vw - 20px);
  min-width: 450px;
  background: var(--default-card-background);
  z-index: 100;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  padding: 30px;
  border-radius: 35px 35px 50px 50px;
  display: grid;
  gap: 20px;
  transform: translateY(-100vh);

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
