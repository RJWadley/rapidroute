import { useQuery } from "@tanstack/react-query"
import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import Layout from "components/Layout"
import PlayerSelect from "components/PlayerSelect"
import { RoutingContext } from "components/Providers/RoutingContext"
import Seo from "components/SEO"
import searchForPlayer from "data/searchPlayers"
import { WorldInfo } from "map/worldInfoType"
import { useContext, useState } from "react"
import styled from "styled-components"
import { loadPage } from "utils/Loader/TransitionUtils"
import media from "utils/media"

export default function SelectPlayer() {
  const [search, setSearch] = useState<string>()
  const [staticPlayers] = useState<string[]>([])
  const { from, to, setFrom, setTo } = useContext(RoutingContext)

  const { data } = useQuery<WorldInfo>({
    queryKey: [
      "https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json",
    ],
    refetchInterval: 5000,
  })
  const newPlayers = data?.players.map(player => player.name) ?? []
  newPlayers.sort((a, b) => a.localeCompare(b))
  newPlayers.forEach(player => {
    if (!staticPlayers.includes(player)) staticPlayers.push(player)
  })

  const playerResults = search
    ? searchForPlayer(search).filter(
        player => !staticPlayers.includes(player.toString()),
      )
    : undefined
  const resultHasSearch = playerResults
    ?.map(x => x.toString().toLowerCase())
    .includes(search?.toLowerCase() ?? "")
  const staticHasSearch = staticPlayers
    .map(x => x.toLowerCase())
    .includes(search?.toLowerCase() ?? "")

  return (
    <Layout>
      <ControlsOverlay />
      <Content>
        <Title>Who are You?</Title>
        <Sub>
          In order to determine your in-game
          <br />
          location, we&apos;ll need your player name
        </Sub>

        <SearchContainer>
          <Cancel
            onClick={() => {
              if (from === "Current Location") setFrom(null)
              if (to === "Current Location") setTo(null)
              loadPage("/", "slide").catch(console.error)
            }}
          >
            Cancel
          </Cancel>
          <Search
            placeholder="Search for a player"
            onChange={e => {
              setSearch(e.target.value)
            }}
          />
          <Icon>search</Icon>
        </SearchContainer>
        <Players>
          {/* First, show the search term directly */}
          {!resultHasSearch && !staticHasSearch && search && (
            <PlayerSelect name={search} key="SearchName" />
          )}
          {/* then, show any static players */}
          {staticPlayers
            .filter(
              player =>
                !search || player.toLowerCase().includes(search.toLowerCase()),
            )
            .map(player => (
              <PlayerSelect key={player} name={player} />
            ))}
          {/* then, show search results */}
          {playerResults?.map(player => (
            <PlayerSelect key={player} name={player.toString()} />
          ))}
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
  padding-bottom: 400px;
`

const Title = styled.h1`
  text-align: center;
  font-size: var(--extra-large);
  color: var(--text-color);
  font-weight: 700;
  margin-bottom: 20px;
`

const Sub = styled.p`
  text-align: center;
  font-size: var(--medium);
  color: var(--text-color);
  font-weight: 400;
  margin-bottom: 50px;
`

const SearchContainer = styled.div`
  position: relative;
  display: flex;

  @media ${media.mobile} {
    display: grid;
  }
`

const Cancel = styled.button`
  background: var(--button-red);
  color: var(--invert-button-red);
  margin-bottom: 20px;
  margin-right: 20px;
  font-size: var(--small);
  font-weight: 700;
  padding: 0 30px;
  display: grid;
  place-items: center;
  border-radius: 30px;
  cursor: pointer;

  @media ${media.mobile} {
    min-height: 35px;
    position: fixed;
    top: 20px;
    left: 20px;
    border-radius: 13px;
    z-index: 101;
  }
`

const Search = styled.input`
  background-color: var(--default-card-background);
  width: 100%;
  padding: 30px;
  margin-bottom: 20px;
  border-radius: 30px;
  font-size: var(--medium);
`

const Icon = styled.div`
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
  font-variation-settings:
    "FILL" 1,
    "wght" 400,
    "GRAD" 0,
    "opsz" 48;
  position: absolute;
  right: 20px;
  bottom: 40px;
  font-size: 40px;

  @media ${media.mobile} {
    bottom: 40px;
    font-size: 35px;
  }
`

const Players = styled.div`
  display: grid;
  gap: 20px;
  width: 100%;
`

export function Head() {
  return <Seo />
}
