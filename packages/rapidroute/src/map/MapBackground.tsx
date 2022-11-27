import React from "react"

import styled from "styled-components"

import useWindowSize from "utils/useWindowSize"

export default function MapBackground() {
  const svgEl = React.useRef<SVGSVGElement>(null)
  const windowSize = useWindowSize()

  return (
    <Wrapper>
      <svg
        ref={svgEl}
        viewBox={`0 0 ${windowSize.width} ${windowSize.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>

        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      <Overlay />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #2e1d3d;
  mix-blend-mode: multiply;
`
