import React, { useEffect } from "react"

import styled from "styled-components"

import Header from "components/Header"
import Layout from "components/Layout"
import PlayerSelect from "components/PlayerSelect"
import SEO from "components/SEO"
import { WorldInfo } from "map/worldInfoType"

export default function SelectPlayer() {
  const [players, setPlayers] = React.useState<string[]>([])
  const [search, setSearch] = React.useState<string>()

  const updatePlayers = () => {
    fetch(
      "https://cors.mrtrapidroute.com/?https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json"
    )
      .then(response => response.json())
      .then((data: WorldInfo) => {
        setPlayers(data.players.map(player => player.name))
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
        Select Player
        <input
          onChange={e => {
            setSearch(e.target.value)
          }}
        />
        <Players>
          {players
            .filter(
              player =>
                !search || player.toLowerCase().includes(search.toLowerCase())
            )
            .map(player => (
              <PlayerSelect key={player} name={player} />
            ))}
          {debouncedSearch && !players.includes(debouncedSearch) && (
            <PlayerSelect name={debouncedSearch} />
          )}
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

const Players = styled.div`
  display: grid;
  gap: 20px;
  width: 100%;
`

export function Head() {
  return <SEO />
}
