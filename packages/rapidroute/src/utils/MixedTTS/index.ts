import EasySpeech from "easy-speech"

import tikSpeak, { cancelTikSpeak } from "./tik/speak"
import tikVoices from "./tik/voices"

if (typeof window !== "undefined") {
  EasySpeech.init({ maxTimeout: 5000, interval: 250 })
    // eslint-disable-next-line no-console
    .then(() => console.log("load complete"))
    .catch(e => console.error(e))
}

export interface UniversalVoice {
  id: string
  lang: string
  name: string
  source: "tik" | "easy-speech"
  speechSynthesisVoice?: SpeechSynthesisVoice
  default?: boolean
}

export const getVoices = (lang: string = "") => {
  const voices: UniversalVoice[] = tikVoices
    .filter(voice => voice.lang.startsWith(lang))
    .map(v => ({
      id: `t${v.id}`,
      lang: v.lang,
      name: `${v.name} (${v.langLabel})`,
      source: "tik",
    }))

  const easySpeechVoices: UniversalVoice[] = EasySpeech.voices()
    // sort by name
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(voice => voice.lang.startsWith(lang))
    // filter out duplicate voices
    .filter(
      (voice, index, self) =>
        index === self.findIndex(v => v.name === voice.name)
    )
    .map(v => ({
      id: `v${v.name}`,
      lang: v.lang,
      name: v.name,
      source: "easy-speech",
      speechSynthesisVoice: v,
      default: v.default,
    }))

  return [...easySpeechVoices, ...voices]
}

let currentVoice: UniversalVoice | undefined
let speechRate = 1

export const setVoiceById = (voice: string) => {
  const allVoices = getVoices()
  const voiceObj = allVoices.find(v => v.id === voice)
  currentVoice = voiceObj
}

export const getDefaultVoice = () => {
  // ranking of preferred voices, in order of preference
  const preferredVoice = "Google US English"

  const fallbackDefaults = [
    // Apple Voices
    "Samantha",
    "Karen",
    "Daniel",
    // Google Voices
    "Google UK English",
    // Microsoft Voices
    "Zira",
    "David",
  ]

  const allVoices = getVoices()

  const bestOption = allVoices.find(v => v.name === preferredVoice)
  if (bestOption) return bestOption

  for (let i = 0; i < fallbackDefaults.length; i += 1) {
    const fallbackOption = allVoices.find(v =>
      v.name.includes(fallbackDefaults[i])
    )
    if (fallbackOption) return fallbackOption
  }

  const defaultOption = allVoices.find(v => v.default)
  if (defaultOption) return defaultOption

  return allVoices[0]
}

export const setSpeechRate = (rate: number) => {
  speechRate = rate
}

export const speak = async (text: string): Promise<void> => {
  const voiceToUse = currentVoice || getDefaultVoice()

  cancelTikSpeak()
  EasySpeech.cancel()

  if (voiceToUse.source === "tik") {
    await tikSpeak(text, voiceToUse.id.slice(1), speechRate)
  } else {
    await EasySpeech.speak({
      text,
      voice: voiceToUse.speechSynthesisVoice,
      rate: speechRate,
    })
  }
}

export const getVoiceById = (id: string) => {
  const allVoices = getVoices()
  return allVoices.find(v => v.id === id)
}
