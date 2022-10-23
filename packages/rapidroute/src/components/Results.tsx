import React, { useContext, useEffect, useRef, useState } from "react"

import gsap from "gsap"
import FindPath, { ResultType } from "pathfinding/findPath"
import resultDiff from "pathfinding/postProcessing/diff"
import removeExtras from "pathfinding/postProcessing/removeExtra"
import styled from "styled-components"
import { sleep } from "utils/functions"

import { RoutingContext } from "./Providers/RoutingContext"
import Route from "./Route"
import Spinner from "./Spinner"

export default function Results() {
  const { from, to } = useContext(RoutingContext)
  const [results, setResults] = useState<
    ResultType[] | null | "none" | "loading"
  >(null)
  const resultsWrapper = useRef<HTMLDivElement>(null)
  const animationOutHolder = useRef<HTMLDivElement>(null)
  const { allowedModes } = useContext(RoutingContext)

  const debouncer = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    if (from && to) {
      const findPath = new FindPath(from, to, allowedModes)
      let canSave = true

      ;(async () => {
        await debouncer.current

        animateOut()
        setResults("loading")

        const minTime = sleep(500)

        findPath
          .start()
          .then(async r => {
            await minTime
            await debouncer.current
            if (canSave) {
              const newResults = removeExtras(r).sort(
                // fewer totalCost comes first
                (a, b) => a.totalCost - b.totalCost
              )
              if (newResults.length && newResults[0].path.length > 1)
                setResults(newResults)
              else setResults("none")
              debouncer.current = sleep(2000)
            }
          })
          .catch(async e => {
            console.error("Error finding path", e)
            await minTime
            await debouncer.current
            if (canSave) setResults("none")
          })
      })().catch(e => {
        console.error("error while finding path", e)
      })

      return () => {
        findPath.cancel()
        canSave = false
      }
    }
    return undefined
  }, [allowedModes, from, to])

  const animateOut = () => {
    // copy the old results to the animation out holder
    // then animate them out
    if (resultsWrapper.current && animationOutHolder.current) {
      const newElement = document.createElement("div")
      animationOutHolder.current.appendChild(newElement)
      newElement.innerHTML = resultsWrapper.current.innerHTML

      const children = Array.from(newElement.children)

      if (!children.length) return

      const firstFive = children.slice(0, 5)
      const allOthers = children.slice(5)

      // first five children
      gsap.fromTo(firstFive, {
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
        })

      // all other children
      if (allOthers.length)
        gsap.fromTo(allOthers, {
            opacity: 1,
            y: 0,
          },
          {
            opacity: 0,
            y: 200,
            duration: 0.5,
            ease: "power3.in",
          })
    }
  }

  useEffect(() => {
    if (resultsWrapper.current?.children.length)
      gsap.fromTo(resultsWrapper.current.children, {
          opacity: 0,
          y: 200,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
        })
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
