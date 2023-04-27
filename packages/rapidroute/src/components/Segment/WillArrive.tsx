import { Place } from "@rapidroute/database-types"
import styled from "styled-components"
import invertLightness from "utils/invertLightness"

interface WillArriveProps {
  destination: Place
}

export default function WillArrive({ destination }: WillArriveProps) {
  return (
    <Wrapper>
      <Icon>check</Icon>
      <Text>
        You will arrive at <br />
        <Strong>{destination.name}</Strong>
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: var(--background-green);
  color: ${invertLightness("var(--background-green)")};
  border-radius: 30px;
  padding: 30px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 30px;
  align-items: center;
  justify-content: center;
  transform: translate(0, 200px);
  opacity: 0;
  max-width: calc(100vw - 40px);
`

const Icon = styled.div`
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
  font-size: var(--symbol);
`

const Text = styled.div`
  font-size: var(--medium);
`

const Strong = styled.strong`
  font-weight: 700;
`
