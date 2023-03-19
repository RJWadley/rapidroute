import { useContext, useEffect, useRef } from "react"

import gsap from "gsap"
import { useSearchParam } from "react-use"
import styled, { keyframes } from "styled-components"

import { useImageHSL } from "utils/averageImageColor"
import { loadPage } from "utils/Loader/TransitionUtils"
import { setLocal } from "utils/localUtils"
import media from "utils/media"
import usePlayerHead from "utils/usePlayerHead"

import { darkModeContext } from "./Providers/DarkMode"
import RoundButton from "./RoundButton"

interface PlayerSelectProps {
  name: string
}

const FADE_DURATION = 0.1

export default function PlayerSelect({ name: nameIn }: PlayerSelectProps) {
  const name = nameIn.replace(/[^A-Za-z0-9_]/g, "").substring(0, 16)
  const imageUrl = usePlayerHead(name)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [hue, saturation] = useImageHSL(imageUrl ?? "")

  useEffect(() => {
    if (wrapperRef.current)
      gsap.to(wrapperRef.current, {
        autoAlpha: 0,
        duration: FADE_DURATION,
      })
  }, [imageUrl])

  const imageLoad = () => {
    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, {
        autoAlpha: 1,
        delay: FADE_DURATION,
      })
      gsap.to(wrapperRef.current.children, {
        autoAlpha: 1,
        delay: FADE_DURATION,
      })
    }
  }

  const isDark = useContext(darkModeContext)
  const backgroundLightness = isDark ? 15 : 85
  const textLightness = isDark ? 85 : 15
  const midLightness = isDark ? 30 : 70

  // get the next url from the current url
  const nextUrl = useSearchParam("redirect") ?? "/"

  return hue !== undefined && saturation !== undefined && imageUrl ? (
    <Wrapper
      backgroundColor={`hsl(${hue}, ${saturation}%, ${backgroundLightness}%)`}
      textColor={`hsl(${hue}, ${saturation}%, ${textLightness}%)`}
      ref={wrapperRef}
    >
      <Image
        $color={`hsl(${hue}, ${saturation}%, ${midLightness}%)`}
        src={imageUrl}
        alt={`${name} player head`}
        onLoad={imageLoad}
        onError={imageLoad}
      />
      <Name>{name}</Name>
      <CustomRound
        onClick={() => {
          setLocal("selectedPlayer", name)
          setLocal("followingPlayer", name)
          loadPage(nextUrl, "slide").catch(console.error)
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
      backgroundColor="var(--default-page-background)"
      textColor="var(--page-background)"
      $loading
    />
  )
}

const pulse = keyframes`
  0% {
    background-position: 40% 0;
  }
  100% {
    background-position: -160% 0;
  }
`

const Wrapper = styled.div<{
  backgroundColor: string
  textColor: string
  $loading?: boolean
}>`
  background-color: ${props => props.backgroundColor};
  color: ${props => props.textColor};
  display: grid;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-radius: 30px;
  grid-template-columns: auto 1fr auto;
  min-height: 120px;
  transition: background-color 0.5s, color 0.5s;
  position: relative;

  :before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      var(--page-background) 0%,
      var(--default-card-background) 10%,
      var(--page-background) 20%
    );
    background-size: 200% 100%;
    animation: ${pulse} 2s ease infinite;
    border-radius: 30px;
    opacity: ${props => (props.$loading ? 1 : 0)};
    transition: opacity 0.5s;
    pointer-events: none;
  }

  > * {
    opacity: 0;
  }

  @media ${media.mobile} {
    min-height: 140px;
    grid-template-columns: 1fr auto;
  }
`

const Image = styled.img<{ $color: string }>`
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
