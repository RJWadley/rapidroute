import React, { useContext, useEffect } from "react"

import gsap from "gsap"
import styled from "styled-components"

import { useImageHSL } from "utils/averageImageColor"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"
import { session, setLocal } from "utils/localUtils"
import media from "utils/media"
import usePlayerHead from "utils/usePlayerHead"

import { darkModeContext } from "./Providers/DarkMode"
import RoundButton from "./RoundButton"

interface PlayerSelectProps {
  name: string
}

export default function PlayerSelect({ name: nameIn }: PlayerSelectProps) {
  const name = nameIn.replace(/[^A-Za-z0-9_]/g, "").substring(0, 16)
  const imageUrl = usePlayerHead(name)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const [hue, saturation] = useImageHSL(imageUrl ?? "")

  useEffect(() => {
    if (hue !== undefined && saturation !== undefined && imageUrl) {
      gsap.to(wrapperRef.current, {
        opacity: 1,
      })
    } else {
      gsap.set(wrapperRef.current, {
        opacity: 0,
      })
    }
  }, [hue, imageUrl, saturation])

  const isDark = useContext(darkModeContext)
  const backgroundLightness = isDark ? 15 : 85
  const textLightness = isDark ? 85 : 15
  const midLightness = isDark ? 30 : 70

  // get the next url from the current url
  const nextUrl = isBrowser()
    ? `/${new URLSearchParams(window.location.search).get("redirect") || ""}`
    : "/"

  return hue !== undefined && saturation !== undefined && imageUrl ? (
    <Wrapper
      backgroundColor={`hsl(${hue}, ${saturation}%, ${backgroundLightness}%)`}
      textColor={`hsl(${hue}, ${saturation}%, ${textLightness}%)`}
      ref={wrapperRef}
    >
      <Image
        color={`hsl(${hue}, ${saturation}%, ${midLightness}%)`}
        src={imageUrl}
        alt={`${name} player head`}
      />
      <Name>{name}</Name>
      <CustomRound
        onClick={() => {
          setLocal("selectedPlayer", name)
          session.following = name
          loadRoute(nextUrl)
        }}
        backgroundColor={`hsl(${hue}, ${saturation}%, ${midLightness}%)`}
        textColor={`hsl(${hue}, ${saturation}%, ${textLightness}%)`}
      >
        arrow_forward
      </CustomRound>
    </Wrapper>
  ) : (
    <Wrapper
      ref={wrapperRef}
      backgroundColor="var(--page-background)"
      textColor="var(--page-background)"
    />
  )
}

const Wrapper = styled.div<{ backgroundColor: string; textColor: string }>`
  background-color: ${props => props.backgroundColor};
  color: ${props => props.textColor};
  display: grid;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-radius: 30px;
  grid-template-columns: auto 1fr auto;
  min-height: 120px;
  opacity: 0;

  @media ${media.mobile} {
    min-height: 0px; //TODO
    grid-template-columns: 1fr auto;
  }
`

const Image = styled.img<{ color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  border: 2px solid ${props => props.color};

  @media ${media.mobile} {
    width: 50px;
    height: 50px;
  }
`

const Name = styled.div`
  font-size: var(--large);
  font-weight: bold;

  @media ${media.mobile} {
    order: -1;
    grid-column: span 2;
  }
`

const CustomRound = styled(RoundButton)<{
  backgroundColor: string
  textColor: string
}>`
  background-color: ${props => props.backgroundColor} !important;
  color: ${props => props.textColor} !important;
`
