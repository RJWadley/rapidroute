/* eslint-disable import/prefer-default-export */

declare module "ttsreader" {
  interface TtsListener {
    onInit?: () => void
    onStart?: () => void
    onDone?: () => void
  }

  interface TtsEngine {
    DEFAULT_LANG: string
    voice: SpeechSynthesisVoice | Record<string, never>
    voices: SpeechSynthesisVoice[]
    rate: number
    utteranceId: number
    startedAndNotTerminatedCounter: number
    listener: TtsListener | null
    utterance: SpeechSynthesisUtterance | Record<string, never>
    init: (listener: TtsListener) => void
    setListener: (listener: TtsListener) => void
    setBestMatchingVoice: (
      voice?: SpeechSynthesisVoice | null,
      voiceURI?: string | null,
      lang?: string | null
    ) => string
    setVoiceByUri: (voiceURI: string) => void
    getVoiceURI: () => string
    setRate: (rate: number) => void
    isInitiated: () => boolean
    speakOut: (text: string) => boolean
    stop(): void
  }

  export const TtsEngine: TtsEngine
}
