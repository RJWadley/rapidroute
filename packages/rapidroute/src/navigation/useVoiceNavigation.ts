import { TtsEngine } from "ttsreader"
import { useDeepCompareMemo } from "use-deep-compare"

import { SegmentType } from "components/createSegments"

import getNavigationInstruction from "./getNavigationInstruction"

TtsEngine.init({
  onInit: () => {
    TtsEngine.setBestMatchingVoice(null, null, "en")
  },
})

export default function useVoiceNavigation(route: SegmentType[]) {
  useDeepCompareMemo(async () => {
    if (!route.length) return

    const firstSegment = route[0]
    const nextSegment = route[1]

    const firstInstruction = await getNavigationInstruction(firstSegment)
    const nextInstruction = await getNavigationInstruction(nextSegment)

    TtsEngine.speakOut(`${firstInstruction}, then ${nextInstruction}`)
  }, [route])
}
