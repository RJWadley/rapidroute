import EasySpeech from "easy-speech"

import tikSpeak, { cancelTikSpeak } from "./tik/speak"
import tikVoices from "./tik/voices"

const easySpeechAvailable = new Promise<boolean>(resolve => {
  if (typeof window !== "undefined") {
    EasySpeech.init({ maxTimeout: 5000, interval: 250 })
      .then(() => {
        resolve(true)
      })
      .catch(e => {
        // easy speech will fail if there are no voices
        console.error(e)
        resolve(false)
      })
  }
})

export interface UniversalVoice {
  id: string
  lang: string
  langLabel: string
  name: string
  source: "tik" | "easy-speech"
  speechSynthesisVoice?: SpeechSynthesisVoice
  default?: boolean
}

export const getVoices = async (lang: string = "en") => {
  const useEasySpeech = await easySpeechAvailable
  const voices: UniversalVoice[] = tikVoices
    .filter(voice => voice.lang.startsWith(lang))
    .map(v => ({
      id: `t${v.id}`,
      lang: v.lang,
      name: v.name,
      langLabel: v.langLabel,
      source: "tik",
    }))

  const languageRegex = /\([\w\s]+\(?\w+\)?\)/g

  const easySpeechVoices: UniversalVoice[] = useEasySpeech
    ? EasySpeech.voices()
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
          name: v.name
            .replace(languageRegex, "")
            .replace(" English", "")
            .replace(/U[KS]/, ""),
          langLabel: v.name
            // filter language labels out
            .replace(v.name.replace(languageRegex, ""), "")
            .replace(/\(English \((\w+)\)\)/g, "$1"),
          source: "easy-speech",
          speechSynthesisVoice: v,
          default: v.default,
        }))
    : []

  return [...easySpeechVoices, ...voices]
}

let currentVoice: UniversalVoice | undefined
let speechRate = 1

export const setVoiceById = async (voice: string) => {
  const allVoices = await getVoices()
  const voiceObj = allVoices.find(v => v.id === voice)
  currentVoice = voiceObj
}

export const getDefaultVoice = async () => {
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

  const allVoices = await getVoices()

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
  const voiceToUse = currentVoice || (await getDefaultVoice())

  cancelTikSpeak()
  if (await easySpeechAvailable) EasySpeech.cancel()

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

export const getVoiceById = async (id: string) => {
  const allVoices = await getVoices()
  return allVoices.find(v => v.id === id)
}
