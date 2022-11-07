/* eslint-disable no-console */
import React, { useContext, useEffect, useRef, useState } from "react"

import { useDeepCompareEffect } from "use-deep-compare"

import { NavigationContext } from "components/Providers/NavigationContext"
import { stopToNumber } from "components/Segment/getLineDirections"

import getTimeToInstruction from "./timeToInstruction"
import { thirtySecondWarning, twoMinuteWarning } from "./useVoiceNavigation"

export default function Countdown() {
  const { currentRoute, spokenRoute} = useContext(NavigationContext)
  const timerInterval = useRef<number>(1000)
  const [timeToInstruction, setTimeToInstruction] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  /**
   * decrease the current time once per second
   * and update the time to instruction
   * 
   * use the spoken route for segment and the current route for calculating the number of stops
   */
  useDeepCompareEffect(() => {
    if (currentRoute.length === 0 || spokenRoute.length === 0) return undefined
    let mounted = true
    const updateTimer = () => {
      if (!mounted) return

      const fromNumber = stopToNumber(currentRoute[0].from.shortName)
      const toNumber = stopToNumber(currentRoute[0].to.shortName)
      const numberOfStops = Math.abs(toNumber - fromNumber)

      const time = Math.round(
        getTimeToInstruction(spokenRoute[0], numberOfStops)
      )
      setTimeToInstruction(Math.max(time, 0))
      setCurrentTime(p => Math.max(0, p - 1))

      setTimeout(updateTimer, timerInterval.current)
    }
    updateTimer()

    return () => {
      mounted = false
    }
  }, [currentRoute, spokenRoute])

  /**
   * update the timer interval if the time to instruction changes
   */
  useEffect(() => {
    const difference = currentTime - timeToInstruction
    if (!Number.isFinite(currentTime) && Number.isFinite(timeToInstruction)) {
      setCurrentTime(0)
    }
    if (difference > 120) {
      setCurrentTime(0)
    } else if (difference > 11) {
      timerInterval.current -= 50
      if (timerInterval.current < 100) {
        timerInterval.current = 100
      }
    } else if (difference < -10) {
      setCurrentTime(timeToInstruction - 10)
    } else if (difference < 0) {
      timerInterval.current = 1050
    } else {
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
    const minutesString = `${hours > 0 ? paddedMinutes : minutes}:`

    return `${hoursString}${minutesString}${paddedSeconds}`
  }

  /**
   * give a two-minute warning
   */
  useEffect(() => {
    if (currentTime === 120) {
      twoMinuteWarning()
    }
    if (currentTime === 30) {
      thirtySecondWarning()
    }
  }, [currentTime])

  return (
    <div>
      <h1>Countdown: {formatTime(currentTime)}</h1>
      <h2>Actual Time: {timeToInstruction}</h2>
    </div>
  )
}
