import { useContext, useEffect, useRef } from "react"

import { PlaceType } from "@rapidroute/database-types"
import { TtsEngine } from "ttsreader"
import { useDeepCompareMemo } from "use-deep-compare"

import AlertMP3 from "audio/alert.mp3"
import CompleteMP3 from "audio/complete.mp3"
import NeutralMP3 from "audio/neutral.mp3"
import SuccessMP3 from "audio/success.mp3"
import { SegmentType } from "components/createSegments"
import { NavigationContext } from "components/Providers/NavigationContext"
import { stopToNumber } from "components/Segment/getLineDirections"
import { isBrowser, sleep } from "utils/functions"
import { session } from "utils/localUtils"

import getNavigationInstruction from "./getNavigationInstruction"

export const CompletionThresholds: Record<PlaceType, number> = {
  "MRT Station": 100,
  Airport: 500,
  City: 500,
  Coordinate: 100,
  Other: 100,
}

if (isBrowser())
  TtsEngine.init({
    onInit: () => {
      TtsEngine.setBestMatchingVoice(null, null, "en")
    },
  })

export const playSound = (
  sound: "alert" | "complete" | "neutral" | "intercom"
) => {
  const audio = new Audio()
  switch (sound) {
    case "alert":
      audio.src = AlertMP3
      break
    case "complete":
      audio.src = CompleteMP3
      break
    case "neutral":
      audio.src = NeutralMP3
      break
    default:
      audio.src = SuccessMP3
      break
  }
  audio.play().catch(console.error)
}

let twoMinuteWarningPhrase = "Two minute warning"
let canSayTwoMinuteWarning = true
export const twoMinuteWarning = () => {
  if (canSayTwoMinuteWarning) {
    playSound("intercom")
    TtsEngine.speakOut(twoMinuteWarningPhrase)
    canSayTwoMinuteWarning = false
  }
}
let thirtySecondWarningPhrase = "Thirty second warning"
let canSayThirtySecondWarning = true
export const thirtySecondWarning = () => {
  if (canSayThirtySecondWarning) {
    playSound("intercom")
    TtsEngine.speakOut(thirtySecondWarningPhrase)
    canSayThirtySecondWarning = false
  }
}

export default function useVoiceNavigation(route: SegmentType[]) {
  const { currentRoute, spokenRoute, setSpokenRoute, navigationComplete } =
    useContext(NavigationContext)
  const rerouted = useRef(false)

  /**
   * every time the spoken route changes, speak the next instruction
   */
  useDeepCompareMemo(async () => {
    await sleep(100)
    if (!route.length || !isBrowser()) return

    const firstSegment = route[0]
    const nextSegment = route[1]

    const firstInstruction = await getNavigationInstruction(firstSegment)
    const nextInstruction =
      route.length === 1
        ? `You will arrive at ${firstSegment.to.shortName}, ${firstSegment.to.name}`
        : await getNavigationInstruction(nextSegment)

    const newTwoMinuteWarning = nextInstruction
      ? `In two minutes, ${nextInstruction}`
      : ""
    twoMinuteWarningPhrase = newTwoMinuteWarning
    canSayTwoMinuteWarning = true
    const newThirtySecondWarning = nextInstruction
      ? `At the next stop, ${nextInstruction}`
      : ""
    thirtySecondWarningPhrase = newThirtySecondWarning

    if (rerouted.current) {
      playSound("neutral")
      rerouted.current = false
    } else playSound("intercom")
    if (firstInstruction && nextInstruction) {
      TtsEngine.speakOut(`${firstInstruction}, then ${nextInstruction}`)
    } else if (firstInstruction) {
      TtsEngine.speakOut(firstInstruction)
    }
  }, [route]).catch(e => {
    console.error("Error in voice navigation", e)
  })

  /**
   * when the navigation is complete, say so
   */
  const youHaveReached = useRef("")
  useDeepCompareMemo(async () => {
    if (navigationComplete && spokenRoute.length === 1) {
      playSound("complete")
      await sleep(500)
      TtsEngine.speakOut(`Navigation complete. ${youHaveReached.current}`)
    }
  }, [navigationComplete, spokenRoute.length]).catch(console.error)
  useEffect(() => {
    if (route.length)
      youHaveReached.current = `You have reached ${
        route[route.length - 1]?.to.shortName
      }, ${route[route.length - 1]?.to.name}`
  }, [route])

  /**
   * Update the spoken route when needed
   */
  useEffect(() => {
    if (spokenRoute === currentRoute) return
    const firstSpoken = spokenRoute[0]
    const spokenProvider = firstSpoken?.routes[0]?.provider
    const spokenNumber = stopToNumber(firstSpoken?.from.uniqueId)

    const firstCurrent = currentRoute[0]
    const currentProvider = firstCurrent?.routes[0]?.provider
    const currentNumber = stopToNumber(firstCurrent?.from.uniqueId)
    const destinationNumber = stopToNumber(firstSpoken?.to.uniqueId)

    // for MRT lines
    if (firstSpoken && firstCurrent) {
      // we are still going to the same stop
      if (firstSpoken.to.uniqueId === firstCurrent.to.uniqueId) {
        // and are still on the same line
        if (spokenProvider === currentProvider) {
          // and we are still within the bounds of the route we spoke
          if (
            (spokenNumber < currentNumber &&
              currentNumber < destinationNumber) ||
            (spokenNumber > currentNumber && currentNumber > destinationNumber)
          ) {
            // the spoken route is still valid
            return
          }
        }
      }
    }

    const distanceBetweenLocs = Math.sqrt(
      ((firstSpoken?.to?.location?.x ?? Infinity) -
        (firstCurrent?.from?.location?.x ?? Infinity)) **
        2 +
        ((firstSpoken?.to?.location?.z ?? Infinity) -
          (firstCurrent?.from?.location?.z ?? Infinity)) **
          2
    )

    // check if the system has rerouted us before we get to the destination
    // if the new from location is the same as the old to location
    if (
      firstSpoken &&
      firstCurrent &&
      // either the id's match
      (firstSpoken.to.uniqueId === firstCurrent.from.uniqueId ||
        // or they are within a reasonable distance of each other
        distanceBetweenLocs <
          Math.max(
            CompletionThresholds[firstSpoken.to.type],
            CompletionThresholds[firstCurrent.from.type]
          ))
    ) {
      // and we are too far away from that location
      const { x: fromX, z: fromZ } = session.lastKnownLocation || {}
      const { x: toX, z: toZ } = firstSpoken.to.location || {}
      const distance = Math.sqrt(
        ((fromX ?? Infinity) - (toX ?? Infinity)) ** 2 +
          ((fromZ ?? Infinity) - (toZ ?? Infinity)) ** 2
      )

      if (distance > CompletionThresholds[firstSpoken.to.type]) {
        // we are not close enough to the destination to be considered there
        // so leave the spoken route as is
        return
      }
    }

    // check if the routes are identical except for the first segment's from location
    if (
      spokenRoute.every((segment, i) => segment.to === currentRoute[i]?.to) &&
      firstSpoken?.from.uniqueId.includes("Coordinate")
    ) {
      return
    }

    // if the first from is not in the previous route, then we have been rerouted
    // and should play a sound
    if (
      firstSpoken &&
      !spokenRoute.some(
        segment =>
          segment.from.uniqueId === firstCurrent?.from.uniqueId ||
          segment.to.uniqueId === firstCurrent?.from.uniqueId
      )
    ) {
      rerouted.current = true
    }

    // if we reach this point, the spoken route is no longer valid and we need to update it
    setSpokenRoute(currentRoute)
  }, [currentRoute, setSpokenRoute, spokenRoute])
}
