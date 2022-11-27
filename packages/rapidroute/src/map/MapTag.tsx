import React from "react"

import styled from "styled-components"

import NavigatorLogo from "images/global/NavigatorLogo.svg"

interface MapTagProps {
  className?: string
}

export default function MapTag({ className = "" }: MapTagProps) {
  const wrapper = React.useRef<HTMLDivElement>(null)

  return (
    <Wrapper ref={wrapper} className={className}>
      <Logo src={NavigatorLogo} alt="MRT Navigator Logo" />
      <Text>MRT Navigator</Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.5));
`

const Logo = styled.img`
  width: 23px;
`

const Text = styled.div`
  font-size: var(--extra-small);
`
