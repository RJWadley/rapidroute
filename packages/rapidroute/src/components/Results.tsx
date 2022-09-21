import React, { useContext, useEffect, useRef, useState } from "react"

import FindPath from "pathfinding/findPath"
import resultDiff from "pathfinding/postProcessing/diff"
import removeExtras from "pathfinding/postProcessing/removeExtra"

import gsap from "gsap"
import styled from "styled-components"
import { sleep } from "utils/functions"
import { RoutingContext } from "./Providers/RoutingContext"
import Route from "./Route"

export default function Results() {
  const { from, to } = useContext(RoutingContext)
  const [results, setResults] = useState<string[][] | null>(null)
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
        setResults(null)

        const minTime = sleep(500)

        findPath.start().then(async r => {
          await minTime
          await debouncer.current
          if (canSave) {
            setResults(removeExtras(r))
            debouncer.current = sleep(2000)
          }
        })
      })()

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
          stagger: 0.3,
        })
  }, [results])

  const diff = results && resultDiff(results)
  return (
    <>
      <OutWrapper ref={animationOutHolder} />
      <ResultsWrapper ref={resultsWrapper}>
        {diff &&
          results.map((result, i) => (
            <Route
              expandByDefault={results.length === 1}
              key={result.toString()}
              route={result}
              diff={diff[i]}
              loadDelay={i * 0.3}
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

const ResultsWrapper = styled.div`
  margin-bottom: 100vh;
`
