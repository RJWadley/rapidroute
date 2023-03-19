import { useContext } from "react"

import styled from "styled-components"

import { darkModeContext } from "components/Providers/DarkMode"
import { useImageHSL } from "utils/averageImageColor"
import UniversalLink from "utils/Loader/UniversalLink"
import { getLocal } from "utils/localUtils"
import usePlayerHead from "utils/usePlayerHead"

export default function SelectedPlayerSetting() {
  const player = getLocal("selectedPlayer")?.toString()
  const playerHead = usePlayerHead(player)
  const [hue, saturation] = useImageHSL(playerHead)

  const isDark = useContext(darkModeContext)
  const backgroundLightness = isDark ? 15 : 85
  const textLightness = isDark ? 85 : 15
  const midLightness = isDark ? 30 : 70

  return player &&
    hue !== undefined &&
    saturation !== undefined &&
    playerHead ? (
    <Wrapper
      background={`hsl(${hue}, ${saturation}%, ${backgroundLightness}%)`}
      $color={`hsl(${hue}, ${saturation}%, ${textLightness}%)`}
    >
      <Name>{player}</Name>
      {playerHead && <Head src={playerHead} alt="your player head" />}
      <Swap
        to="/select-player"
        transition="slide"
        background={`hsl(${hue}, ${saturation}%, ${midLightness}%)`}
      >
        Swap Player
      </Swap>
    </Wrapper>
  ) : (
    <Wrapper background="var(--mid-background)" $color="var(--text-color)">
      <Name>Player Name</Name>
      {playerHead && <Head src={playerHead} alt="steve player head" />}
      <Swap
        to="/select-player"
        background="var(--dark-background)"
        transition="slide"
      >
        Select Player
      </Swap>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  background: string
  $color: string
}>`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 20px;
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

const Swap = styled(UniversalLink)<{ background: string }>`
  font-size: var(--medium);
  border-radius: 10px;
  padding: 10px;
  grid-column: span 2;
  text-align: center;
  font-weight: bold;
  background-color: ${({ background }) => background};
`
