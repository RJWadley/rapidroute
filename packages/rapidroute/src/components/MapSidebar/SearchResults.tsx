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
          {items?.map(id => (
            <SearchResult
              id={id}
              key={id}
              setItem={setItem}
              selected={focusedItem === id}
            />
          ))}
          {items.length === 0 && <div>No results...</div>}
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  background: var(--mid-background);
  padding: 40px 20px 20px;
  margin-top: -20px;
  position: relative;
  z-index: -1;
  border-radius: 0 0 20px 20px;
  margin-bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: start;
`
