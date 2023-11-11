import { sleep } from "utils/functions"
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

let currentAudio: HTMLAudioElement | undefined

async function playAudio(data: string, rate: number) {
  if (!currentAudio) currentAudio = new Audio()
  currentAudio.src = `data:assets/audiompeg;base64,${data}`
  currentAudio.playbackRate = rate

  await currentAudio.play().catch(() => {
    console.info("audio playback interrupted")
  })

  // wait for the audio to finish playing
  await new Promise<void>(resolve => {
    const onEnded = () => {
      currentAudio?.removeEventListener("ended", onEnded)
      return resolve()
    }
    currentAudio?.addEventListener("ended", onEnded)
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
        .then(async res => {
          if (res.ok) {
            return res.json()
          }
          if (res.status === 429) {
            // get the retry after header
            const retryAfter = res.headers.get("Retry-After")

            // if the header is present, wait for that amount of time
            const timeToWaitInMs = retryAfter
              ? parseInt(retryAfter, 10) * 1000
              : 10_000 + Math.random() * 10_000

            await sleep(timeToWaitInMs)

            preloadedAudio[voice] = {
              ...preloadedAudio[voice],
              [text]: undefined,
            }

            return preloadAudio(text, voice)
          } else {
            throw new Error("Request to speech api failed")
          }
        })
        .then((resp: unknown) => {
          return isSpeechResponse(resp) ? resolve(resp.data) : resolve(null)
        })
        .catch(console.error)
    }),
  }
}

export default tikSpeak
