import SearchResult from "components/MapSidebar/SearchResult"
import styled from "styled-components"
import media from "utils/media"

interface SearchListProps {
  items: string[] | undefined
  focusedItem: string | undefined
  selectItem: (index: string) => void
}

export default function SearchList({
  items,
  focusedItem,
  selectItem,
}: SearchListProps): JSX.Element {
  return (
    <>
      {items !== undefined && (
        <Wrapper>
          {items.map(id => (
            <SearchResult
              id={id}
              key={id}
              setItem={selectItem}
              selected={focusedItem === id}
            />
          ))}
          {items.length === 0 && <div>No Results</div>}
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--mid-background);
  padding: 30px;
  padding-top: 130px;
  border-radius: 30px;
  display: grid;
  font-size: var(--extra-small);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -2;

  @media ${media.mobile} {
    padding: 15px;
    padding-top: 40px;
    border-radius: 25px;
    transform: translateY(-25px);
  }
`
