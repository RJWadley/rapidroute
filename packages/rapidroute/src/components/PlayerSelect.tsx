import React, { useContext, useEffect, useState } from "react"

import { navigate } from "gatsby-link"
import styled from "styled-components"

import averageImageHue from "utils/averageImageColor"
import { isBrowser } from "utils/functions"
import { setLocal } from "utils/localUtils"

import { darkModeContext } from "./Providers/DarkMode"
import RoundButton from "./RoundButton"

interface PlayerSelectProps {
  name: string
}

export default function PlayerSelect({ name: nameIn }: PlayerSelectProps) {
  const name = nameIn.replace(/[^A-Za-z0-9_]/g, "").substring(0, 16)
  const [imageUrl, setImageUrl] = useState<string>()
  useEffect(() => {
    let isCancelled = false
    setImageUrl(undefined)
    fetch(`https://api.minetools.eu/uuid/${name}`)
      .then(response => response.json())
      .then(uuidData => {
        return `https://crafatar.com/avatars/${
          uuidData.id || "8667ba71-b85a-4004-af54-457a9734eed7"
        }?overlay`
      })
      .then(url => {
        if (!isCancelled) setImageUrl(url)
      })
    return () => {
      isCancelled = true
    }
  }, [name])

  const [hue, setHue] = useState<number>()
  useEffect(() => {
    let isCancelled = false
    setHue(undefined)
    if (imageUrl)
      averageImageHue(imageUrl).then(newHue => {
        setTimeout(() => {
          if (!isCancelled) setHue(newHue)
        }, 100)
      })
    return () => {
      isCancelled = true
    }
  }, [imageUrl])

  const isDark = useContext(darkModeContext)
  const backgroundLightness = isDark ? 0.15 : 0.85
  const textLightness = isDark ? 0.85 : 0.15
  const midLightness = isDark ? 0.3 : 0.7

  // get the next url from the current url
  const nextUrl = isBrowser()
    ? new URLSearchParams(window.location.search).get("next") || "/"
    : "/"

  return hue && imageUrl ? (
    <Wrapper
      backgroundColor={`hsl(${hue * 360}, 100%, ${backgroundLightness * 100}%)`}
      textColor={`hsl(${hue * 360}, 100%, ${textLightness * 100}%)`}
    >
      <Image
        hue={hue}
        src={imageUrl}
        alt={`${name} player head`}
        onError={() => {
          const newSrc =
            "https://crafatar.com/avatars/8667ba71-b85a-4004-af54-457a9734eed7?overlay=true"
          setImageUrl(newSrc)
          setHue(undefined)
        }}
      />
      <Name>{name}</Name>
      <CustomRound
        onClick={() => {
          setLocal("selectedPlayer", name)
          window.following = name
          navigate(nextUrl)
        }}
        backgroundColor={`hsl(${hue * 360}, 100%, ${midLightness * 100}%)`}
        textColor={`hsl(${hue * 360}, 100%, ${textLightness * 100}%)`}
      >
        arrow_forward
      </CustomRound>
    </Wrapper>
  ) : null
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
`

const Image = styled.img<{ hue: number }>`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  border: 2px solid ${props => `hsl(${props.hue * 360}, 100%, 50%)`};
`

const Name = styled.div`
  font-size: 40px;
  font-weight: bold;
`

const CustomRound = styled(RoundButton)<{
  backgroundColor: string
  textColor: string
}>`
  background-color: ${props => props.backgroundColor};
  color: ${props => props.textColor};
`
