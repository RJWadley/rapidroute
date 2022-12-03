import React from "react"

import styled from "styled-components"

import { ReactComponent as Logo } from "images/global/RapidRouteLogo.svg"
import loadRoute from "utils/loadRoute"
import media from "utils/media"

import Settings from "./Settings"

export default function Header() {
  return (
    <Wrapper>
      <LogoWrapper
        onClick={() => {
          loadRoute("/")
        }}
      >
        <StyledLogo />
        <Text>
          <div>
            <Strong>MRT</Strong>&nbsp;Rapidroute
          </div>
          <Colors>
            <div />
            <div />
            <div />
            <div />
          </Colors>
        </Text>
      </LogoWrapper>
      <Settings />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 20px;
`

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
`

const StyledLogo = styled(Logo)`
  height: 40px;
`

const Text = styled.div`
  font-size: var(--medium);
  margin-bottom: 10px;
`

const Strong = styled.strong`
  font-weight: 700;
`

const Colors = styled.div`
  height: 3px;
  width: 75px;
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

  @media ${media.mobile} {
    width: 77px;
    height: 4px;
  }
`
