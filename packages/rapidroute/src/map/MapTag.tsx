import styled from "styled-components"

import RapidRouteLogo from "images/global/RapidRouteLogo.svg"

interface MapTagProps {
  className?: string
}

export default function MapTag({ className = "" }: MapTagProps) {
  const wrapper = React.useRef<HTMLDivElement>(null)

  return (
    <Wrapper ref={wrapper} className={className}>
      <Logo src={RapidRouteLogo} alt="MRT RapidRoute Logo" />
      <Text>MRT RapidRoute</Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.5));
`

const Logo = styled.img`
  width: 23px;
`

const Text = styled.div`
  font-size: var(--extra-small);
  color: #ccc;
`
