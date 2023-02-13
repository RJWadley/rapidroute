import { BaseTexture, SCALE_MODES, Texture } from "pixi.js"
import { Sprite, Stage } from "react-pixi-fiber"
import { useMeasure } from "react-use"
import styled from "styled-components"

import PixiViewport from "./PixiViewport"
import Satellite from "./Satellite"

export default function Map() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  const SpriteTexture = Texture.from(
    "https://pixijs.io/pixi-react/img/bunny.png"
  )

  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST

  return (
    <Wrapper ref={ref}>
      <Stage
        options={{ backgroundAlpha: 1, width, height, backgroundColor: "red" }}
      >
        <PixiViewport width={width} height={height}>
          <Satellite />
          <Sprite texture={SpriteTexture} x={0} y={0} />
        </PixiViewport>
      </Stage>
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
