import React, { useContext, useEffect } from "react"

import { Link } from "gatsby"
import styled from "styled-components"

import Header from "components/Header"
import Layout from "components/Layout"
import PlayerSelect from "components/PlayerSelect"
import { RoutingContext } from "components/Providers/RoutingContext"
import SEO from "components/SEO"
import { WorldInfo } from "map/worldInfoType"

export default function SelectPlayer() {
  const [players, setPlayers] = React.useState<string[]>([])
  const [search, setSearch] = React.useState<string>()
  const {from, to, setFrom, setTo} = useContext(RoutingContext)

  const updatePlayers = () => {
    fetch(
      "https://cors.mrtrapidroute.com/?https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json"
    )
      .then(response => response.json())
      .then((data: WorldInfo) => {
        setPlayers(prev => [...prev, ...data.players.map(player => player.name)].filter(
          (value, index, self) => self.indexOf(value) === index
        ))
      })
      .catch(e => {
        console.error("Could not get information from dynmap", e)
      })
  }

  useEffect(() => {
    updatePlayers()
    const interval = setInterval(updatePlayers, 10000)
    return () => clearInterval(interval)
  }, [])

  const [debouncedSearch, setDebouncedSearch] = React.useState<string>()
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <Layout>
      <Header />
      <Content>
        <Title>Who are You?</Title>
        <Sub>
          In order to determine your location, we&apos;ll need your name
        </Sub>

        <SearchContainer>
          <Cancel to="/" onClick={()=>{
            if (from === "Current Location") setFrom(null)
            if (to === "Current Location") setTo(null)
          }}>Cancel</Cancel>
          <Search
            placeholder="Search for a player"
            onChange={e => {
              setSearch(e.target.value)
            }}
          />
          <Icon>search</Icon>
        </SearchContainer>
        <Players>
          {players
            .filter(
              player =>
                !search || player.toLowerCase().includes(search.toLowerCase())
            )
            .map(player => (
              <PlayerSelect key={player} name={player} />
            ))}
          {debouncedSearch &&
            players.every(
              player => player.toLowerCase() !== search?.toLowerCase()
            ) && <PlayerSelect name={debouncedSearch} />}
        </Players>
      </Content>
    </Layout>
  )
}

const Content = styled.div`
  max-width: calc(100vw - 40px);
  width: 1000px;
  margin: 0 auto;
  margin-top: 200px;
  padding-bottom: 200px;
`

const Title = styled.h1`
  text-align: center;
  font-size: 48px;
  color: var(--text-color);
  font-weight: 700;
  margin-bottom: 20px;
`

const Sub = styled.p`
  text-align: center;
  font-size: 24px;
  color: var(--text-color);
  font-weight: 400;
  margin-bottom: 50px;
`

const SearchContainer = styled.div`
  position: relative;
  display: flex;
`

const Cancel = styled(Link)`
  background: var(--button-red);
  color: var(--invert-button-red);
  margin-bottom: 20px;
  margin-right: 20px;
  font-size: 20px;
  font-weight: 700;
  padding: 0 30px;
  display: grid;
  place-items: center;
  border-radius: 30px;
`

const Search = styled.input`
  background-color: var(--default-card-background);
  width: 100%;
  padding: 30px;
  margin-bottom: 20px;
  border-radius: 30px;
  font-size: 20px;
`

const Icon = styled.div`
  font-family: "Material Symbols Outlined";
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 40px;
`

const Players = styled.div`
  display: grid;
  gap: 20px;
  width: 100%;
`

export function Head() {
  return <SEO />
}
