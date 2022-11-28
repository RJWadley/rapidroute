import { TtsEngine } from "ttsreader"

import tikSpeak, { cancelTikSpeak } from "./tik/speak"
import tikVoices from "./tik/voices"

if (typeof window !== "undefined") {
  TtsEngine.init({})
}

export interface UniversalVoice {
  id: string
  lang: string
  name: string
  source: "tik" | "ttsreader"
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

  const ttsReaderVoices: UniversalVoice[] = TtsEngine.voices
    .filter(voice => voice.lang.startsWith(lang))
    .map(v => ({
      id: `v${v.name}`,
      lang: v.lang,
      name: v.name,
      source: "ttsreader",
    }))

  return [...ttsReaderVoices, ...voices]
}

let currentVoice: UniversalVoice | undefined
let speechRate = 1

export const setVoiceById = (voice: string) => {
  const allVoices = getVoices()
  const voiceObj = allVoices.find(v => v.id === voice)
  currentVoice = voiceObj
}

export const getDefaultVoice = () => {
  const allVoices = getVoices()
  return allVoices.find(v => v.lang === "en-US") || allVoices[0]
}

export const setSpeechRate = (rate: number) => {
  speechRate = rate
}

export const speak = async (text: string): Promise<void> => {
  const voiceToUse = currentVoice || getDefaultVoice()

  cancelTikSpeak()
  TtsEngine.stop()

  if (voiceToUse.source === "tik") {
    await tikSpeak(text, voiceToUse.id.slice(1), speechRate)
  } else {
    const voiceId = voiceToUse.id.slice(1)
    TtsEngine.setVoiceByUri(voiceId)
    TtsEngine.setRate(speechRate)
    TtsEngine.speakOut(text)
  }
}

export const getVoiceById = (id: string) => {
  const allVoices = getVoices()
  return allVoices.find(v => v.id === id)
}
