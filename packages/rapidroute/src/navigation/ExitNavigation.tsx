import React, { useContext } from "react"

import { Link } from "gatsby"
import styled from "styled-components"

import { NavigationContext } from "components/Providers/NavigationContext"

export default function ExitNavigation() {
  const { currentRoute } = useContext(NavigationContext)

  const destination = currentRoute[currentRoute.length - 1]?.to
  return (
    <>
      <Blurred />
      <Wrapper>
        <ExitButton to="/">&times;</ExitButton>
        <Text>
          <Head>Navigation to {destination?.shortName}</Head>
          <Sub>{destination?.name}</Sub>
        </Text>
      </Wrapper>
    </>
  )
}

const Blurred = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  width: 350px;
  height: 80px;
  z-index: -1; // the blur has to be behind the segments or we get a rendering bug
  border-radius: 25px;
  backdrop-filter: blur(3px);
`

const Wrapper = styled.div`
  background-color: var(--glassy-default-card-background);
  border-radius: 25px;

  position: sticky;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  padding: 15px;
  display: flex;
`

const ExitButton = styled(Link)`
  font-size: 40px;
  line-height: 46px;
  font-weight: bold;
  background-color: var(--button-red);
  color: var(--invert-button-red);
  width: 50px;
  height: 50px;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  margin-right: 12px;
`

const Text = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Head = styled.div`
  font-size: 24px;
  font-weight: bold;
`

const Sub = styled.div`
  font-size: 12px;
`
