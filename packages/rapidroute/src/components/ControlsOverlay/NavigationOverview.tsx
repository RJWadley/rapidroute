import styled from "styled-components"

import { ReactComponent as Logo } from "assets/images/global/NavigatorLogo.svg"

import { Bold } from "./NavHistory"

/**
 * simply display the navigator logo and a glassy background
 */
export default function NavigationOverview() {
  return (
    <Wrapper>
      <StyledLogo />
      <h1>
        <Bold>MRT</Bold> Navigator
      </h1>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: #1118;
  backdrop-filter: blur(3px);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
  gap: 10px;
  position: relative;

  :before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100px;
    height: 100%;
    background: linear-gradient(-90deg, rgba(0, 0, 0, 0) 0%, #111 100%);
    z-index: -1;
  }

  :after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100%;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, #111 100%);
    z-index: -1;
  }
`

const StyledLogo = styled(Logo)`
  width: 20px;
`
