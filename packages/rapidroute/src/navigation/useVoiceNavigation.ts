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

export default function useVoiceNavigation(route: SegmentType[]) {
  const { isRouteComplete } = useContext(NavigationContext)

  useDeepCompareMemo(async () => {
    if (!route.length || !isBrowser()) return

    if (isRouteComplete) {
      const lastSegment = route[route.length - 1]
      const { to } = lastSegment
      TtsEngine.speakOut(`You have arrived at ${to.name}`)
      return
    }

    const firstSegment = route[0]
    const nextSegment = route[1]

    const firstInstruction = await getNavigationInstruction(firstSegment)
    const nextInstruction = await getNavigationInstruction(nextSegment)

    if (firstInstruction && nextInstruction)
      TtsEngine.speakOut(`${firstInstruction}, then ${nextInstruction}`)
    else if (firstInstruction) TtsEngine.speakOut(firstInstruction)
  }, [route]).catch(e => {
    console.error("Error in voice navigation", e)
  })
}
