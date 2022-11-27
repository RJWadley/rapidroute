import React, { useEffect, useMemo } from "react"

import gsap from "gsap"
import { ScrollToPlugin } from "gsap/all"
import styled, { css } from "styled-components"
import { TtsEngine } from "ttsreader"

import { isBrowser } from "utils/functions"
import { getLocal, setLocal } from "utils/localUtils"

if (isBrowser()) {
  TtsEngine.init({})
}

gsap.registerPlugin(ScrollToPlugin)

export default function VoiceSetting() {
  const bestVoice = useMemo(() => {
    if (isBrowser()) {
      return TtsEngine.setBestMatchingVoice(null, null, "en")
    }
    return ""
  }, [])
  const allVoice = useMemo(() => {
    if (isBrowser()) {
      return TtsEngine.voices.filter(v => v.lang.startsWith("en"))
    }
    return []
  }, [])

  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [currentVoice, setCurrentVoice] = React.useState(bestVoice)

  useEffect(() => {
    gsap.to(dropdownRef.current, {
      height: open ? 30 * 12.5 : 40,
      ease: "power3",
      duration: 0.5,
      scrollTo: { y: 0 },
    })
    gsap.set(dropdownRef.current, {
      overflow: open ? "scroll" : "hidden",
      delay: open ? 0 : 0.5,
    })
  }, [open])

  const updateVoice = (voice: string) => {
    if (!open) {
      setOpen(true)
      return
    }
    setCurrentVoice(voice)
    setLocal("voice", voice)

    TtsEngine.setVoiceByUri(voice)
    TtsEngine.setRate(getLocal("speechRate") ?? 1)
    TtsEngine.speakOut(`Hi, my name is ${voice
      .replace("default", bestVoice)
      .replace(/\([\s\S]+\)/g, "")}.
        This is what I'll sound like when I'm helping you find your
        way around on the Mine cart Rapid Transit Server.
    `)
  }

  useEffect(() => {
    setCurrentVoice(getLocal("voice") ?? "default")
  }, [])

  /**
   * handle click outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof HTMLElement &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    window.addEventListener("click", handleClickOutside)
    return () => {
      window.removeEventListener("click", handleClickOutside)
    }
  }, [])

  return (
    <PositionWrapper>
      <Dropdown ref={dropdownRef}>
        <Voice
          active={false}
          onClick={() => {
            setOpen(!open)
          }}
        >
          {open ? "Close Dropdown" : "Select Voice"}
        </Voice>
        <Voice
          active={false}
          onClick={() => {
            updateVoice("default")
          }}
        >
          Default ({bestVoice})
        </Voice>
        {allVoice.map(v => (
          <Voice
            active={v.name === currentVoice}
            key={v.name}
            onClick={() => {
              updateVoice(v.name)
            }}
          >
            {v.name}
          </Voice>
        ))}
      </Dropdown>
    </PositionWrapper>
  )
}

const PositionWrapper = styled.div`
  height: 50px;
  background: var(--mid-background);
  border-radius: 20px;
`

const Dropdown = styled.div`
  overflow: hidden;
  padding: 10px 20px 0;
  background: var(--mid-background);
  border-radius: 20px;
  z-index: 101;
  position: relative;
`

const Voice = styled.button<{ active: boolean }>`
  ${p =>
    p.active &&
    css`
      position: sticky;
      bottom: 0;
    `};
  display: block;
  height: 30px;
  background: var(--mid-background);
  width: 100%;
  cursor: pointer;

  :last-child {
    margin-bottom: 10px;
  }
`
