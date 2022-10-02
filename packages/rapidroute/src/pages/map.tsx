import React, { useEffect } from "react"

import styled from "styled-components"

import MapCanvas from "map/MapCanvas"

export default function MapTest() {
  const [following, setFollowing] = React.useState<string | undefined>()

  useEffect(() => {
    // wait 10 seconds and then start following
    setTimeout(() => {
      setFollowing("_mossie")
    }, 5000)
  }, [])

  return (
    <Wrapper>
      <MapCanvas following={following} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
  overscroll-behavior: none;
`
