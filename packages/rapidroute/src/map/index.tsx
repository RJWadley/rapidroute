import { Stage } from "@pixi/react"
import { useMeasure } from "react-use"
import styled from "styled-components"

export default function Map() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  return (
    <Wrapper ref={ref}>
      <Stage width={width} height={height} options={{ backgroundAlpha: 1 }} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
`
