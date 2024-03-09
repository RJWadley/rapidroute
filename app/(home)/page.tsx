import { styled } from "@linaria/react"
import { prisma } from "data/client"

import MapBackground from "./MapBackground"
import SearchPane from "./SearchPane"

export default async function HomeView() {
  const initialPlaces = await prisma.place.findMany()

  return (
    <Wrapper>
      <MapBackground />
      <SearchPane initialPlaces={initialPlaces} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 20px;
  min-height: 100dvh;
`
