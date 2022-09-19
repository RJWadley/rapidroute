import React, { useContext, useEffect, useRef, useState } from "react"

import FindPath from "pathfinding/findPath"
import resultDiff from "pathfinding/postProcessing/diff"
import removeExtras from "pathfinding/postProcessing/removeExtra"

import gsap from "gsap"
import styled from "styled-components"
import { RoutingContext } from "./Providers/RoutingContext"
import Route from "./Route"

export default function Results() {
  const { from, to } = useContext(RoutingContext)
  const [results, setResults] = useState<string[][] | null>(null)
  const resultsWrapper = useRef<HTMLDivElement>(null)
  const animationOutHolder = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (from && to) {
      const findPath = new FindPath(from, to)

      animateOut()
      setResults(null)

      findPath.start().then(r => setResults(removeExtras(r)))

      return () => {
        findPath.cancel()
      }
    }
    return undefined
  }, [from, to])

  const animateOut = () => {
    // copy the old results to the animation out holder
    // then animate them out
    if (resultsWrapper.current && animationOutHolder.current) {
      const newElement = document.createElement("div")
      animationOutHolder.current.appendChild(newElement)
      newElement.innerHTML = resultsWrapper.current.innerHTML

      const children = Array.from(newElement.children)

      // first five children
      gsap.fromTo(children.slice(0, 5), {
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
      gsap.fromTo(children.slice(5), {
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

  const diff = results && resultDiff(results)
  return (
    <>
      <OutWrapper ref={animationOutHolder} />
      <div ref={resultsWrapper}>
        {diff &&
          results.map((result, i) => (
            <Route
              expandByDefault={i === 0}
              key={result.toString()}
              route={result}
              diff={diff[i]}
            />
          ))}
      </div>
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
