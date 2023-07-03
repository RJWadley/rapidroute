import styled from "styled-components"

import SearchResult from "./SearchResult"

export default function SearchResults({
  items,
  setItem,
  focusedItem,
}: {
  items: string[] | undefined
  focusedItem: string | undefined
  setItem: (item: string) => void
}) {
  return (
    <>
      {items !== undefined && (
        <Wrapper>
          {items.map(id => (
            <SearchResult
              id={id}
              key={id}
              setItem={setItem}
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
  background: var(--mid-background);
  padding: 60px 20px 20px;
  margin-top: -40px;
  position: relative;
  z-index: -1;
  border-radius: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: start;
`
