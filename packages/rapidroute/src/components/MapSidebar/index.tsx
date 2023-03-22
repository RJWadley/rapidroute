import styled from "styled-components"

import media from "utils/media"

import ItemInformation from "./ItemInformation"
import MapSearchBox from "./SearchBox"

export default function MapSidebar() {
  return (
    <Wrapper>
      <MapSearchBox />
      <ItemInformation />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 350px;
  margin: 0 20px;
  position: relative;
  z-index: 1;
  
  @media ${media.mobile} {
    width: calc(100vw - 40px);
    pointer-events: none;
    > * {
      pointer-events: auto;
    }
  }
`
