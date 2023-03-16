import { useContext } from "react"

import styled from "styled-components"

import { MapSearchContext } from "components/Providers/MapSearchContext"

import useWiki from "./useWiki"

export default function ItemInformation() {
  const { activeItem } = useContext(MapSearchContext)
  const { value, loading } = useWiki(activeItem)

  return (
    <>
      {value && !loading && (
        <Wrapper>
          {value.images?.[0] && <img src={value.images[0]} alt={value.title} />}
          <TextContent>
            <Title>{value.title}</Title>
            <Desc>{value.blurb}</Desc>
            <Link href={value.pageUrl} target="_blank" rel="noreferrer">
              Read more
            </Link>
          </TextContent>
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  background: var(--default-card-background);
  border-radius: 20px;
  margin-top: 20px;
  isolation: isolate;
  overflow: hidden;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);

  img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    background: var(--mid-background);
    image-rendering: pixelated;
  }
`

const TextContent = styled.div`
  padding: 20px;
  display: grid;
  gap: 15px;
  justify-items: start;
  color: var(--text-color);
  position: relative;
`

const Title = styled.h1`
  font-size: var(--medium);
  font-weight: bold;
`

const Desc = styled.p`
  font-size: var(--extra-small);

  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Link = styled.a`
  background-color: var(--button-green);
  color: var(--invert-button-green);
  padding: 10px 20px;
  display: block;
  border-radius: 5px;
  font-weight: 600;
  transition: background 0.2s ease-in-out;
`
