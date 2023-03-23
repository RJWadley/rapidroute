import { useState, useEffect } from "react"

export default function DelayRender({
  children,
  time = 600,
}: {
  children: React.ReactNode
  time?: number
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true)
    }, time)

    return () => clearTimeout(timeout)
  }, [time])

  return show ? <>{children}</> : null
}
