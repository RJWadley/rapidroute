import isObject from "utils/isObject"

const ENDPOINT = "https://tiktok-tts.weilnet.workers.dev"
const TEXT_BYTE_LIMIT = 300

interface SpeechResponse {
  success: boolean
  data: string | null
  error: string | null
}

const isSpeechResponse = (data: unknown): data is SpeechResponse => {
  return (
    isObject(data) &&
    data.success !== undefined &&
    typeof data.success === "boolean" &&
    data.data !== undefined &&
    (data.data === null || typeof data.data === "string") &&
    data.error !== undefined &&
    (data.error === null || typeof data.error === "string")
  )
}

const preloadedAudio: Record<
  string,
  Record<string, Promise<string | null> | undefined>
> = {}

let currentAudio: HTMLAudioElement | null = null

async function playAudio(data: string, rate: number) {
  const audio = new Audio(`data:audio/mpeg;base64,${data}`)
  audio.playbackRate = rate
  currentAudio?.pause()
  await audio.play()
  currentAudio = audio

  // wait for the audio to finish playing
  await new Promise(resolve => {
    audio.addEventListener("ended", resolve)
  })
}

export const cancelTikSpeak = () => {
  currentAudio?.pause()
}

const tikSpeak = async (
  text: string,
  voice: string,
  speechRate: number
): Promise<void> => {
  preloadAudio(text, voice).catch(console.error)
  const speechRateClamped = Math.max(0.2, Math.min(2, speechRate))

  // if the text is longer than the limit, split it into multiple requests
  if (text.length > TEXT_BYTE_LIMIT) {
    const lastSpace = text.slice(0, TEXT_BYTE_LIMIT).lastIndexOf(" ")
    const firstHalf = text.slice(0, lastSpace)
    const secondHalf = text.slice(lastSpace + 1)
    await tikSpeak(firstHalf, voice, speechRate).then(() =>
      tikSpeak(secondHalf, voice, speechRate)
    )
    return
  }

  if (preloadedAudio[voice]?.[text]) {
    const data = await preloadedAudio[voice]?.[text]
    if (data) {
      await playAudio(data, speechRateClamped)
    }
  }
}

const preloadAudio = async (text: string, voice: string): Promise<void> => {
  if (preloadedAudio[voice]?.[text]) {
    return
  }

  // if the text is longer than the limit, split it into multiple requests
  if (text.length > TEXT_BYTE_LIMIT) {
    const lastSpace = text.slice(0, TEXT_BYTE_LIMIT).lastIndexOf(" ")
    const firstHalf = text.slice(0, lastSpace)
    const secondHalf = text.slice(lastSpace + 1)
    await preloadAudio(firstHalf, voice).then(() =>
      preloadAudio(secondHalf, voice)
    )
    return
  }

  preloadedAudio[voice] = {
    ...preloadedAudio[voice],
    [text]: new Promise(resolve => {
      fetch(`${ENDPOINT}/api/generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          if (res.status === 429) {
            setTimeout(() => {
              preloadedAudio[voice][text] = undefined
              preloadAudio(text, voice).catch(console.error)
            }, 10000 + Math.random() * 10000)
          }
          return undefined
        })
        .then((resp: unknown) => {
          if (isSpeechResponse(resp)) {
            resolve(resp.data)
          } else {
            resolve(null)
          }
        })
        .catch(console.error)
    }),
  }
}

export default tikSpeak