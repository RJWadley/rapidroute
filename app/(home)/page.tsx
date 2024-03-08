import { styled } from "@linaria/react"
import Map from "components/Map"
import BackgroundIMG from "components/Map/Placeholder.png"
import { Suspense } from "react"
import UniversalImage from "utils/UniversalImage"

export default function HomeView() {
  return (
    <Wrapper>
      <BackgroundWrapper>
        <Background src={BackgroundIMG} alt="" priority />
      </BackgroundWrapper>
      <Suspense fallback={null}>
        <Map />
      </Suspense>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;

  > * {
    grid-area: 1 / 1 / 2 / 2;
  }
`
const BackgroundWrapper = styled.div`
  width: 100%;
  height: 100dvh;
  position: relative;
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
