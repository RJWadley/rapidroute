import { useContext } from "react"

import { TtsEngine } from "ttsreader"
import { useDeepCompareMemo } from "use-deep-compare"

import { SegmentType } from "components/createSegments"
import { NavigationContext } from "components/Providers/NavigationContext"
import { isBrowser } from "utils/functions"

import getNavigationInstruction from "./getNavigationInstruction"

if (isBrowser())
  TtsEngine.init({
    onInit: () => {
      TtsEngine.setBestMatchingVoice(null, null, "en")
    },
  })

let twoMinuteWarningPhrase = "Two minute warning"
let canSayTwoMinuteWarning = true
export const twoMinuteWarning = () => {
  if (canSayTwoMinuteWarning) {
    TtsEngine.speakOut(twoMinuteWarningPhrase)
    canSayTwoMinuteWarning = false
  }
}
let thirtySecondWarningPhrase = "Thirty second warning"
let canSayThirtySecondWarning = true
export const thirtySecondWarning = () => {
  if (canSayThirtySecondWarning) {
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

    if (firstInstruction && nextInstruction)
      TtsEngine.speakOut(`${firstInstruction}, then ${nextInstruction}`)
    else if (firstInstruction) TtsEngine.speakOut(firstInstruction)
  }, [route]).catch(e => {
    console.error("Error in voice navigation", e)
  })

  /**
   * when the navigation is complete, say so
   */
  useDeepCompareMemo(() => {
    if (navigationComplete)
      TtsEngine.speakOut(
        `Navigation complete, you have reached ${
          route[route.length - 1].to.shortName
        }, ${
          route[route.length - 1].to.name
        }`
      )
  },[navigationComplete, route])
}
