import React, { useContext, useEffect, useState } from "react"

import gsap from "gsap"
import styled from "styled-components"

import { MineTools } from "types/MineTools"
import averageImageHue from "utils/averageImageColor"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"
import { session, setLocal } from "utils/localUtils"
import media from "utils/media"

import { darkModeContext } from "./Providers/DarkMode"
import RoundButton from "./RoundButton"

interface PlayerSelectProps {
  name: string
}

export default function PlayerSelect({ name: nameIn }: PlayerSelectProps) {
  const fallbackUUID = "ec561538-f3fd-461d-aff5-086b22154bce"
  const name = nameIn.replace(/[^A-Za-z0-9_]/g, "").substring(0, 16)
  const [imageUrl, setImageUrl] = useState<string>()
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isCancelled = false
    setImageUrl(undefined)
    fetch(`https://api.minetools.eu/uuid/${name}`)
      .then(response => response.json())
      .then((uuidData: MineTools) => {
        return `https://crafatar.com/avatars/${
          uuidData.id || fallbackUUID
        }?overlay`
      })
      .then(url => {
        if (!isCancelled) setImageUrl(url)
      })
      .catch(e => {
        console.error(`Error fetching UUID for player ${name}`, e)
        if (!isCancelled) setImageUrl(undefined)
      })
    return () => {
      isCancelled = true
    }
  }, [name])

  const [hue, setHue] = useState<number>()
  const [saturation, setSaturation] = useState<number>()
  useEffect(() => {
    let isCancelled = false
    setHue(undefined)
    if (imageUrl)
      averageImageHue(imageUrl)
        .then(newHSL => {
          setTimeout(() => {
            if (!isCancelled) {
              setHue(newHSL[0] * 360)
              setSaturation(newHSL[1] * 300)
            }
          }, 100)
        })
        .catch(e => {
          console.error(`Error fetching average hue for player ${name}`, e)
          if (!isCancelled) {
            setHue(0)
            setSaturation(0)
          }
        })
    return () => {
      isCancelled = true
    }
  }, [imageUrl, name])

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
        onError={() => {
          const newSrc = `https://crafatar.com/avatars/${fallbackUUID}?overlay`
          setImageUrl(newSrc)
          setHue(undefined)
        }}
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
