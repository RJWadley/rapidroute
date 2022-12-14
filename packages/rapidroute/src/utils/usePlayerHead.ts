import { useEffect, useState } from "react"

import { MojangUUIDResponse } from "types/Mojang"

const fallbackUUID = "ec561538-f3fd-461d-aff5-086b22154bce"

const fetchedNames: { [name: string]: Promise<string> } = {}

export default function usePlayerHead(name: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [retrySignal, setRetrySignal] = useState(0)

  useEffect(() => {
    if (!name) {
      setImageUrl(`https://crafatar.com/avatars/${fallbackUUID}?overlay`)
      return
    }

    if (name in fetchedNames) {
      fetchedNames[name].then(setImageUrl).catch(console.error)
      return
    }

    fetchedNames[name] = new Promise(resolve => {
      fetch(
        `https://cors.mrtrapidroute.com/?https://api.mojang.com/users/profiles/minecraft/${name}`
      )
        .then(response => {
          if (response.status === 429) {
            setTimeout(() => {
              delete fetchedNames[name]
              setRetrySignal(retrySignal + 1)
            }, 1000)
          }

          return response.json()
        })
        .then((uuidData: MojangUUIDResponse) => {
          return `https://crafatar.com/avatars/${
            uuidData.id || fallbackUUID
          }?overlay`
        })
        .then(url => {
          setImageUrl(url)
          resolve(url)
        })
        .catch(() => {
          delete fetchedNames[name]
          setImageUrl(`https://crafatar.com/avatars/${fallbackUUID}?overlay`)
          resolve(`https://crafatar.com/avatars/${fallbackUUID}?overlay`)
        })
    })
  }, [name, retrySignal])

  return imageUrl
}
