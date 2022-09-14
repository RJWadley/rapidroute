import { useEffect } from "react"

import { sleep } from "./functions"

let waitingForPage = true

export async function pageReady(callback?: VoidFunction) {
  // eslint-disable-next-line no-await-in-loop
  while (waitingForPage) await sleep(100)

  return callback?.()
}

export function useDocumentReady() {
  useEffect(() => {
    waitingForPage = false

    return () => {
      waitingForPage = true
    }
  })
}
