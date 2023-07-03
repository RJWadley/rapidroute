"use client"

import { runImport } from "updater"
import { useState } from "react"

export default function Temp() {
  const [status, setStatus] = useState("waiting")

  const clickAction = () => {
    ;(async () => {
      setStatus("importing")

      await runImport()

      setStatus("done!")
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
