"use client"

import { useState } from "react"
import { runImport } from "updater"

export default function Temp() {
  const [status, setStatus] = useState("waiting")

  const clickAction = () => {
    ;(async () => {
      setStatus("importing")

      runImport()
        .then((e) => {
          console.log(e)
          return setStatus("done!")
        })
        .catch(console.error)
    })().catch((error) => {
      setStatus("error")
      console.error(error)
    })
  }

  return (
    <div>
      <h1>Status: {status}</h1>
      <button onClick={clickAction}>click me</button>
    </div>
  )
}
