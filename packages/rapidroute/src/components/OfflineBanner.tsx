import { useState } from "react"

import { useInterval } from "react-use"
import styled from "styled-components"

import { isBrowser } from "utils/functions"

let showOfflineBanner = false

export function setShowOfflineBanner(value: boolean) {
  showOfflineBanner = value
}

export default function OfflineBanner() {
  const [showBanner, setShowBanner] = useState(false)
  useInterval(() => {
    setShowBanner(showOfflineBanner)
  }, 1000)
  if (!showBanner || !isBrowser()) return null
  return (
    <Wrapper>
      We&apos;re having trouble connecting. Check your internet connection, or
      view our <Link href="https://status.mrtrapidroute.com">status page</Link>.
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: var(--button-red);
  color: var(--invert-button-red);
  text-align: center;
  font-size: var(--medium);
  font-weight: 500;
  padding: 20px;
`

const Link = styled.a`
  text-decoration: underline;
`
