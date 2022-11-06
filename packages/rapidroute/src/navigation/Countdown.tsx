/* eslint-disable no-console */
import React, { useContext, useEffect, useRef, useState } from "react"

import { useDeepCompareEffect } from "use-deep-compare"

import { NavigationContext } from "components/Providers/NavigationContext"

import getTimeToInstruction from "./timeToInstruction"

export default function Countdown() {
  const { currentRoute } = useContext(NavigationContext)
  const timerInterval = useRef<number>(1000)
  const [timeToInstruction, setTimeToInstruction] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  /**
   * decrease the current time once per second
   * and update the time to instruction
   */
  useDeepCompareEffect(() => {
    let mounted = true
    const updateTimer = () => {
      if (!mounted) return

      const time = Math.round(getTimeToInstruction(currentRoute[0]))
      setTimeToInstruction(time)
      setCurrentTime(p => Math.max(0, p - 1))

      setTimeout(updateTimer, timerInterval.current)
    }
    updateTimer()

    return () => {
      mounted = false
    }
  }, [currentRoute])

  /**
   * update the timer interval if the time to instruction changes
   */
  useEffect(() => {
    const difference = currentTime - timeToInstruction
    if (!Number.isFinite(currentTime) && Number.isFinite(timeToInstruction)) {
      setCurrentTime(0)
    }
    if (difference > 11) {
      console.log("speeding up timer")
      timerInterval.current -= 50
      if (timerInterval.current < 10) {
        timerInterval.current = 10
      }
    } else if (difference < -10) {
      console.log("pausing timer for a bit")
      setCurrentTime(timeToInstruction - 10)
    } else if (difference < 0) {
      console.log("slowing down timer")
      timerInterval.current = 1050
    } else {
      console.log("keeping timer at 1s")
      timerInterval.current = 1000
    }
  }, [timeToInstruction, currentTime])

  /**
   * format the time left
   * 1 seconds -> 0:01
   * 60 seconds -> 1:00
   * 2400 seconds -> 40:00
   * 4000 seconds -> 1:06:40
   * @param numSeconds the number of seconds to format
   */
  const formatTime = (numSeconds: number) => {
    const hours = Math.floor(numSeconds / 3600)
    const minutes = Math.floor((numSeconds - hours * 3600) / 60)
    const seconds = numSeconds - hours * 3600 - minutes * 60

    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes

    const hoursString = hours > 0 ? `${hours}:` : ""
    const minutesString =
      minutes > 0 ? `${hours > 0 ? paddedMinutes : minutes}:` : ""
    const secondsString = seconds > 0 ? `${paddedSeconds}` : ""

    return `${hoursString}${minutesString}${secondsString}`
  }

  return (
    <div>
      <h1>Countdown: {formatTime(currentTime)}</h1>
      <h2>Actual Time: {formatTime(timeToInstruction)}</h2>
    </div>
  )
}
