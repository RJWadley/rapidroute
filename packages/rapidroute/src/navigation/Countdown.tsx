/* eslint-disable no-console */
import React, { useContext, useEffect, useRef, useState } from "react"

import { RouteMode } from "@rapidroute/database-types"
import styled from "styled-components"
import { useDeepCompareEffect } from "use-deep-compare"

import { darkModeContext } from "components/Providers/DarkMode"
import { NavigationContext } from "components/Providers/NavigationContext"
import { stopToNumber } from "components/Segment/getLineDirections"
import invertLightness from "utils/invertLightness"

import getTimeToInstruction from "./timeToInstruction"
import { thirtySecondWarning, twoMinuteWarning } from "./useVoiceNavigation"

export default function Countdown({
  type = "walk",
}: {
  type?: RouteMode | undefined
}) {
  const { currentRoute, spokenRoute } = useContext(NavigationContext)
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

      const numberToUse = Number.isFinite(numberOfStops) ? numberOfStops : 0

      const time = Math.round(getTimeToInstruction(spokenRoute[0], numberToUse))
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

    if (!Number.isFinite(numSeconds)) return "Waiting"

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

  const isDark = useContext(darkModeContext)
  const backgroundColor = isDark ? "#07380f" : "#bbf7c5"
  const textColor = invertLightness(backgroundColor)

  return (
    <Wrapper className="segment" data-flip-id="countdown" dark={isDark ?? false}>
      <Inner>
        {type === "MRT" ? (
          <>
            <Arriving>Arriving in</Arriving>
            <Time textColor={textColor} backgroundColor={backgroundColor}>
              {formatTime(currentTime)}
            </Time>
          </>
        ) : (
          <Arriving>Up Next</Arriving>
        )}
      </Inner>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  dark: boolean
}>`
  margin-top: 20px;
  margin-bottom: -50px;
  height: 80px;
  position: relative;
  z-index: 1;
  background-color: ${({ dark }) => (dark ? "#1119" : "#eeea")};
  border-radius: 20px 20px 0 0;
  transition: border-radius 0.5s;
  backdrop-filter: blur(3px);

  // a shadow to fade out the bottom of the countdown
  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 50px;
    background: linear-gradient(
      to bottom,
      ${({ dark }) => (dark ? "#1119" : "#eeea")} 0%,
      transparent 100%
    );
    opacity: 1;
    transition: opacity 0.1s;
  }

  &.flipping {
    border-radius: 20px;
    &:after {
      opacity: 0;
    }
  }
`

const Inner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  padding: 0 30px;
`

const Arriving = styled.div`
  font-size: 24px;
  font-weight: bold;
`

const Time = styled.div<{
  textColor: string
  backgroundColor: string
}>`
  background-color: ${p => p.backgroundColor}55;
  border: 1px solid ${p => p.textColor};
  color: ${p => p.textColor};
  border-radius: 99px;
  height: fit-content;
  width: fit-content;
  padding: 2px 15px;
`
