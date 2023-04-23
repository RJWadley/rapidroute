import { wrap } from "comlink"
import { getAll } from "data/getData"
import gsap from "gsap"
import { ResultType } from "pathfinding/findPath"
import { FindPathWorkerType } from "pathfinding/findPath/findPathWorker"
import getPlayerLocation from "pathfinding/getPlayerLocation"
import resultDiff from "pathfinding/postProcessing/diff"
import removeExtras from "pathfinding/postProcessing/removeExtra"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useAsync } from "react-use"
import styled from "styled-components"
import { isBrowser, sleep } from "utils/functions"
import { loadPage } from "utils/Loader/TransitionUtils"
import { getLocal } from "utils/localUtils"
import useIsMounted from "utils/useIsMounted"

import { RoutingContext } from "./Providers/RoutingContext"
import Route from "./Route"
import Spinner from "./Spinner"

const { findPath, initPathfinder } =
  (() => {
    if (!isBrowser()) return
    const worker = new Worker(
      new URL("pathfinding/findPath/findPathWorker", import.meta.url)
    )
    return wrap<FindPathWorkerType>(worker)
  })() ?? {}

getAll("pathfinding")
  .then(data => {
    return initPathfinder?.(data)
  })
  .catch(console.error)

const CURRENT_LOCATION = "Current Location"

export default function Results() {
  const { from, to } = useContext(RoutingContext)
  const [results, setResults] = useState<
    ResultType[] | null | "none" | "loading"
  >(null)
  const resultsWrapper = useRef<HTMLDivElement>(null)
  const animationOutHolder = useRef<HTMLDivElement>(null)
  const { allowedModes } = useContext(RoutingContext)
  const debouncer = useRef<Promise<unknown>>(Promise.resolve())
  const isMounted = useIsMounted()

  /**
   * get the player location if the from or to is the current location
   */
  const playerLocation = useMemo(async () => {
    if (from === CURRENT_LOCATION || to === CURRENT_LOCATION) {
      const player = getLocal("selectedPlayer")?.toString()
      if (player) {
        const { x, z } = (await getPlayerLocation(player)) ?? {}
        if (!x || !z) return
        return `Coordinate: ${x}, ${z}`
      }
    }
  }, [from, to])

  useAsync(async () => {
    if (!from || !to) return
    await debouncer.current
    const fromToUse = from === CURRENT_LOCATION ? await playerLocation : from
    const toToUse = to === CURRENT_LOCATION ? await playerLocation : to

    if (!fromToUse || !toToUse) {
      if (!getLocal("selectedPlayer")) {
        loadPage("/select-player", "slide").catch(console.error)
        return
      }
      setResults("none")
      return
    }

    animateOut()
    setResults("loading")

    const minTime = sleep(500)

    const r = await findPath?.(fromToUse, toToUse, allowedModes)

    await minTime
    await debouncer.current
    if (isMounted.current && r) {
      const newResults = removeExtras(r).sort(
        // fewer totalCost comes first
        (a, b) => a.totalCost - b.totalCost
      )
      const firstResult = newResults[0]
      if (firstResult && firstResult.path.length > 1) setResults(newResults)
      else setResults("none")
      debouncer.current = sleep(2000)
    }
  }, [allowedModes, from, playerLocation, to])

  const animateOut = () => {
    // copy the old results to the animation out holder
    // then animate them out
    if (resultsWrapper.current && animationOutHolder.current) {
      const newElement = document.createElement("div")
      animationOutHolder.current.append(newElement)
      // eslint-disable-next-line no-unsanitized/property
      newElement.innerHTML = resultsWrapper.current.innerHTML

      const children = [...newElement.children]

      if (children.length === 0) return

      const firstFive = children.slice(0, 5)
      const allOthers = children.slice(5)

      // first five children
      gsap.fromTo(
        firstFive,
        {
          opacity: 1,
          y: 0,
        },
        {
          opacity: 0,
          y: 200,
          duration: 0.5,
          stagger: -0.1,
          ease: "power3.in",
          onComplete: () => {
            if (animationOutHolder.current)
              animationOutHolder.current.innerHTML = ""
          },
        }
      )

      // all other children
      if (allOthers.length > 0)
        gsap.fromTo(
          allOthers,
          {
            opacity: 1,
            y: 0,
          },
          {
            opacity: 0,
            y: 200,
            duration: 0.5,
            ease: "power3.in",
          }
        )
    }
  }

  useEffect(() => {
    if (resultsWrapper.current?.children.length)
      gsap.fromTo(
        resultsWrapper.current.children,
        {
          opacity: 0,
          y: 200,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
        }
      )
  }, [results])

  const diff =
    results &&
    typeof results === "object" &&
    resultDiff(results.map(r => r.path))

  return (
    <>
      <OutWrapper ref={animationOutHolder} />
      <OutWrapper>
        <Message show={results === "none"}>No Results</Message>
        <Spinner show={results === "loading"} />
      </OutWrapper>
      <ResultsWrapper ref={resultsWrapper}>
        {diff &&
          results.map((result, i) => (
            <Route
              expandByDefault={results.length === 1}
              key={result.path.toString()}
              route={result}
              diff={diff[i]}
            />
          ))}
      </ResultsWrapper>
    </>
  )
}

const OutWrapper = styled.div`
  height: 0;
  z-index: -1;
  position: relative;

  > div {
    position: absolute;
    left: 0;
    width: 100%;
  }
`

const Message = styled.div<{ show: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-top: 100px;
  opacity: ${props => (props.show ? 1 : 0)};
  transition: opacity 0.5s;
`

const ResultsWrapper = styled.div`
  margin-bottom: 50vh;
`
