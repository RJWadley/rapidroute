import { useContext } from "react"

import { TtsEngine } from "ttsreader"
import { useDeepCompareMemo } from "use-deep-compare"

import AlertMP3 from "audio/alert.mp3"
import CompleteMP3 from "audio/complete.mp3"
import NeutralMP3 from "audio/neutral.mp3"
import SuccessMP3 from "audio/success.mp3"
import { SegmentType } from "components/createSegments"
import { NavigationContext } from "components/Providers/NavigationContext"
import { isBrowser, sleep } from "utils/functions"

import getNavigationInstruction from "./getNavigationInstruction"

if (isBrowser())
  TtsEngine.init({
    onInit: () => {
      TtsEngine.setBestMatchingVoice(null, null, "en")
    },
  })

export const playSound = (
  sound: "alert" | "complete" | "neutral" | "success"
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
    playSound("success")
    TtsEngine.speakOut(twoMinuteWarningPhrase)
    canSayTwoMinuteWarning = false
  }
}
let thirtySecondWarningPhrase = "Thirty second warning"
let canSayThirtySecondWarning = true
export const thirtySecondWarning = () => {
  if (canSayThirtySecondWarning) {
    playSound("success")
    TtsEngine.speakOut(thirtySecondWarningPhrase)
    canSayThirtySecondWarning = false
  }
}

export default function useVoiceNavigation(route: SegmentType[]) {
  const { navigationComplete } = useContext(NavigationContext)

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

    playSound("success")
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
  useDeepCompareMemo(async () => {
    if (navigationComplete) {
      playSound("complete")
      await sleep(500)
      TtsEngine.speakOut(
        `Navigation complete, you have reached ${
          route[route.length - 1].to.shortName
        }, ${route[route.length - 1].to.name}`
      )
    }
  }, [navigationComplete, route]).catch(console.error)
}
