import React from "react"

import { ReactComponent as Logo } from "images/global/RapidRouteLogo.svg"
import styled from "styled-components"

export default function Header() {
  return (
    <Wrapper>
      <StyledLogo />
      <Text>
        <div>
          <Strong>MRT</Strong> Rapidroute
        </div>
        <Colors>
          <div />
          <div />
          <div />
          <div />
        </Colors>
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  height: 75px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: absolute;
  top: 20px;
  left: 20px;
  scale: 0.75; // TODO this lazy af
  transform-origin: top left;
`

const StyledLogo = styled(Logo)`
  height: 100%;
`

const Text = styled.div`
  font-family: Inter;
  font-size: 40px;
  margin-bottom: 10px;
`

const Strong = styled.strong`
  font-weight: 700;
`

const Colors = styled.div`
  height: 6px;
  width: 120px;
  display: flex;
  border-radius: 3px;
  overflow: hidden;

  div {
    height: 100%;
    width: 25%;
  }

  div:nth-child(1) {
    background-color: var(--rapid-blue);
  }
  div:nth-child(2) {
    background-color: var(--rapid-red);
  }
  div:nth-child(3) {
    background-color: var(--rapid-yellow);
  }
  div:nth-child(4) {
    background-color: var(--rapid-green);
  }
`
