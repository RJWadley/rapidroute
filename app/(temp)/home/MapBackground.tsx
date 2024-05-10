import { styled } from "@linaria/react"
import Map from "(temp)/components/Map"
import BackgroundIMG from "components/Map/Placeholder.png"
import { Suspense } from "react"
import UniversalImage from "(temp)/utils/UniversalImage"

export default function MapBackground() {
  return (
    <>
      <BackgroundWrapper>
        <Background src={BackgroundIMG} alt="" priority />
      </BackgroundWrapper>
      <MapWrapper>
        <Suspense fallback={null}>
          <Map />
        </Suspense>
      </MapWrapper>
    </>
  )
}

const BackgroundWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  overflow: clip;
  pointer-events: none;
`

const Background = styled(UniversalImage)`
  width: auto;
  height: 1920px;
  object-fit: cover;
  max-width: unset;
  max-height: unset;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(10px);
  border-radius: 100px;
`

const MapWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100lvh;
`
