import styled from "styled-components"
import media from "utils/media"

import AllowedModes from "./AllowedModes"
import SearchBox from "./SearchBox"
import SwapButton from "./SwapButton"

export default function Selection() {
  return (
    <div>
      <SearchContainer>
        <SearchBox searchRole="from" />
        <SearchBox searchRole="to" />
        <SwapButton />
      </SearchContainer>
      <AllowedModes />
    </div>
  )
}

const SearchContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 100px;
  grid-template-areas: "from swap to";
  position: relative;
  z-index: 1;

  ::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--default-card-background);
    border-radius: 30px;
    z-index: -1;
  }

  > label:nth-child(2) {
    text-align: right;
  }

  @media ${media.mobile} {
    grid-template-columns: 1fr auto;
    grid-template-areas: "from swap" "to swap";
    min-height: 80px;
    padding-right: 15px;

    ::before {
      border-radius: 25px;
    }

    > label:nth-child(2) {
      text-align: left;
    }
  }
`
