import React, { Fragment } from "react"

import styled from "styled-components"

/**
 * group the array of strings by their common letters, ignoring numbers
 *
 * for example, given ["a1", "a2", "b1", "b2", "c1", "d1", "d2"]
 * it will return [["a1", "a2"], ["b1", "b2"], ["c1"], ["d1", "d2"]]
 */
const groupByCommonLetters = (arr: string[]) => {
  const groups: string[][] = []
  let group: string[] = []
  let prev = ""
  arr.forEach(str => {
    const curr = str.replace(/\d/g, "")
    if (curr !== prev) {
      if (group.length > 0) {
        groups.push(group)
      }
      group = []
      prev = curr
    }
    group.push(str)
  })
  if (group.length > 0) {
    groups.push(group)
  }
  return groups
}

/**
 * given groups of strings, return a string that best describes each group
 *
 * for example, given [["a1", "a2"], ["b1", "b2"], ["c1"], ["d1", "d2"]]
 * it will return ["a", "b", "c1", "d"]
 */
const describeGroups = (groups: string[][]) => {
  return groups.map(group => {
    if (group.length === 1) return group[0]

    // find the common prefix
    let prefix = ""
    for (let i = 0; i < group[0].length; i += 1) {
      const char = group[0][i]
      if (group.every(str => str[i] === char) && /\D/.test(char)) {
        prefix += char
      } else {
        break
      }
    }

    return prefix
  })
}

/**
 * join the array of strings with commas and the last one with "and"
 * strings from the array should be bold
 *
 * if the array is empty, return "fastest route"
 */
const listify = (arr: string[]) => {
  if (arr.length === 0) {
    return <B>Fastest Route</B>
  }
  if (arr.length === 1) {
    return <B>{arr[0]}</B>
  }
  if (arr.length === 2) {
    return (
      <>
        <B>{arr[0]}</B> and <B>{arr[1]}</B>
      </>
    )
  }
  return (
    <>
      {arr.slice(0, -1).map(str => (
        <Fragment key={str}>
          <B>{str}</B>,{" "}
        </Fragment>
      ))}
      and <B>{arr[arr.length - 1]}</B>
    </>
  )
}

export default function describeDiff(diff: string[]) {
  const groups = groupByCommonLetters(diff)
  const descriptions = describeGroups(groups)
  return listify(descriptions)
}

const B = styled.strong`
  font-weight: 600;
`
