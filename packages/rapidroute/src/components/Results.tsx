import React, { useContext, useEffect, useState } from "react"

import styled, { keyframes } from "styled-components"

import FindPath from "pathfinding/findPath"
import resultDiff from "pathfinding/postProcessing/diff"
import removeExtras from "pathfinding/postProcessing/removeExtra"

import { RoutingContext } from "./Providers/RoutingContext"
import Route from "./Route"

export default function Results() {
  const { from, to } = useContext(RoutingContext)
  const [results, setResults] = useState<string[][] | null>(null)

  useEffect(() => {
    if (from && to) {
      const findPath = new FindPath(from, to)
      setResults(null)

      findPath.start().then(r => setResults(removeExtras(r)))

      return () => {
        findPath.cancel()
      }
    }
    return undefined
  }, [from, to])

  if (results) {
    const diff = resultDiff(results)
    return (
      <>
        {results.map((result, i) => (
          <Route key={result.toString()} route={result} diff={diff[i]} />
        ))}
      </>
    )
  }

  return <Spinner />
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }         
`

const Spinner = styled.div`
  width: 200px;
  height: 200px;
  margin: 100px;
  border: 10px solid #f3f;
  animation: ${spin} 2s linear infinite;
`
