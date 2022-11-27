import React, { useContext } from "react"

import styled from "styled-components"

import { darkModeContext } from "components/Providers/DarkMode"
import { useImageHSL } from "utils/averageImageColor"
import { getLocal } from "utils/localUtils"
import usePlayerHead from "utils/usePlayerHead"

export default function SelectedPlayerSetting() {
  const player = getLocal("selectedPlayer")?.toString()

  const playerHead = usePlayerHead(player ?? "")

  const isDark = useContext(darkModeContext)
  const [hue, saturation] = useImageHSL(playerHead)
  const backgroundLightness = isDark ? 15 : 85
  const textLightness = isDark ? 85 : 15
  const midLightness = isDark ? 30 : 70

  return player && hue !== undefined && saturation !== undefined && playerHead ? (
    <Wrapper
      background={`hsl(${hue}, ${saturation}%, ${backgroundLightness}%)`}
      $color={`hsl(${hue}, ${saturation}%, ${textLightness}%)`}
    >
      <Name>{player}</Name>
      {playerHead && <Head src={playerHead} alt="your player head" />}
      <Swap href="/select-player" background={
        `hsl(${hue}, ${saturation}%, ${midLightness}%)`
      }>Swap Player</Swap>
    </Wrapper>
  ) : null
}

const Wrapper = styled.div<{
    background: string
    $color: string
}>`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px 20px;
  padding: 10px;
  border-radius: 20px;
  background-color: ${({ background }) => background};
  color: ${({ $color }) => $color};
  
`

const Name = styled.div`
  font-size: var(--medium);
  transform: translateY(2px);
`

const Head = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
`

const Swap = styled.a<{ background: string }>`
    font-size: var(--medium);
    border-radius: 10px;
    padding: 10px;
    grid-column: span 2;
    text-align: center;
    font-weight: bold;
    background-color: ${({ background }) => background};
`