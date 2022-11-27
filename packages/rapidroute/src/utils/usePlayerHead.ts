import { useEffect, useState } from "react"

import { MineTools } from "types/MineTools"

const fallbackUUID = "ec561538-f3fd-461d-aff5-086b22154bce"

const fetchedNames: { [name: string]: Promise<string> } = {}

export default function usePlayerHead(name: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (name in fetchedNames) {
      fetchedNames[name].then(setImageUrl).catch(console.error)
      return () => {}
    }

    let isCancelled = false
    setImageUrl(null)
    fetchedNames[name] = new Promise(resolve => {
      fetch(`https://api.minetools.eu/uuid/${name}`)
        .then(response => response.json())
        .then((uuidData: MineTools) => {
          return `https://crafatar.com/avatars/${
            uuidData.id || fallbackUUID
          }?overlay`
        })
        .then(url => {
          if (!isCancelled) setImageUrl(url)
          resolve(url)
        })
        .catch(e => {
          console.error(`Error fetching UUID for player ${name}`, e)
          if (!isCancelled) {
            setImageUrl(`https://crafatar.com/avatars/${fallbackUUID}?overlay`)
            resolve(`https://crafatar.com/avatars/${fallbackUUID}?overlay`)
          }
        })
    })
    return () => {
      isCancelled = true
    }
  }, [name])

  return imageUrl
}
