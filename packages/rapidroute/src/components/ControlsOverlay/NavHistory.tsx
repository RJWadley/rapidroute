import { useContext, useEffect, useRef, useState } from "react"

import { Location } from "@rapidroute/database-types"
import gsap from "gsap"
import styled from "styled-components"

import { ReactComponent as Logo } from "assets/images/global/RapidRouteLogo.svg"
import { RoutingContext } from "components/Providers/RoutingContext"
import { getPath } from "data/getData"
import { getLocal, setLocal } from "utils/localUtils"

export default function NavHistory() {
  const logo = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { from, to, setFrom, setTo } = useContext(RoutingContext)
  const [history, setHistory] = useState<[string, string][]>(
    getLocal("navigationHistory") || []
  )
  const [locations, setLocations] = useState<Record<string, Location>>({})

  /**
   * hide the logo until the page is scrolled down
   */
  useEffect(() => {
    const handleScroll = () => {
      const hidden = window.scrollY < 100

      gsap.to(logo.current, {
        opacity: hidden ? 0 : 1,
        width: hidden ? 0 : "auto",
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /**
   * track the search history
   */
  useEffect(() => {
    if (!from || !to) return
    // if this entry already exists in the history, don't add it again
    if (history.slice(0, 6).some(([f, t]) => f === from && t === to)) return
    const newItem: [string, string] = [from, to]
    const newHistory = [newItem, ...history]
    setHistory(newHistory)
    setLocal("navigationHistory", newHistory.slice(0, 30))
  }, [from, to, history])

  /**
   * fetch location names!
   */
  useEffect(() => {
    const ids = [...new Set(history.flat())]
    ids.forEach(id => {
      if (!locations[id]) {
        getPath("locations", id)
          .then(location => {
            if (location) setLocations(prev => ({ ...prev, [id]: location }))
          })
          .catch(console.error)
      }
    })
  }, [history, locations])

  /**
   * animate in when a new item is added to the history
   */
  useEffect(() => {
    const boxes = wrapperRef.current?.querySelectorAll(".box")
    if (boxes)
      gsap.to(boxes, {
        opacity: 1,
        width: "auto",
        stagger: 0.1,
        marginRight: 10,
        ease: "power3.inOut",
        duration: 2,
      })
  })

  const historyItems = history.map((item, index) => {
    const fromLocation = locations[item[0]]
    const toLocation = locations[item[1]]
    const fromName =
      fromLocation?.type === "City"
        ? fromLocation.name
        : fromLocation?.shortName ?? undefined
    const toName =
      toLocation?.type === "City"
        ? toLocation.name
        : toLocation?.shortName ?? undefined
    if (!fromName || !toName) return null
    return (
      <Box
        key={`${item[0] + item[1]}${history.length - index}`}
        className="box"
        onClick={() => {
          setFrom(item[0])
          setTo(item[1])
        }}
      >
        <span>
          {fromName} -&gt; {toName}
        </span>
      </Box>
    )
  })

  return (
    <Wrapper ref={wrapperRef}>
      <LogoWrapper ref={logo}>
        <StyledLogo />
        <div>
          <Bold>MRT</Bold>&nbsp;RapidRoute
        </div>
        <Colors>
          <div />
          <div />
          <div />
          <div />
        </Colors>
      </LogoWrapper>
      {historyItems}
      <ShadeOverlay />
    </Wrapper>
  )
}

export const Bold = styled.span`
  font-weight: 700;
`

const Box = styled.div`
  height: calc(var(--height) * 0.6);
  background: #333;
  display: grid;
  place-items: center;
  border-radius: 5px;
  white-space: nowrap;
  width: 0;
  overflow: hidden;
  z-index: 1;
  position: relative;
  cursor: pointer;
  -webkit-app-region: no-drag;
  user-select: none;

  :hover {
    background: #444;
  }

  > * {
    margin: 0 8px;
  }
`

const Wrapper = styled.div`
  --height: env(titlebar-area-height, 40px);
  width: max-content;
  height: var(--height);
  display: flex;
  align-items: center;
  color: #fff;
`

const LogoWrapper = styled.div`
  display: grid;
  grid-template-columns: calc(var(--height) * 0.5) 1fr;
  column-gap: 8px;
  height: calc(var(--height) * 0.5);
  margin: 0 20px;
  width: 0;
  opacity: 0;
`

const StyledLogo = styled(Logo)`
  height: calc(var(--height) * 0.5);
  grid-row: span 2;
`

const Colors = styled.div`
  height: 2px;
  width: 50px;
  display: flex;
  border-radius: 3px;
  overflow: hidden;

  div {
    height: 100%;
    width: 25%;
  }

  div:nth-child(1) {
    background-color: var(--rapid-blue);
  }
  div:nth-child(2) {
    background-color: var(--rapid-red);
  }
  div:nth-child(3) {
    background-color: var(--rapid-yellow);
  }
  div:nth-child(4) {
    background-color: var(--rapid-green);
  }
`

const ShadeOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, #111 100%);
  z-index: 1;
`
