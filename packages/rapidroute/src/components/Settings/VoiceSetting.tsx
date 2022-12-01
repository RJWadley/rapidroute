import React, { useEffect, useState } from "react"

import gsap from "gsap"
import { ScrollToPlugin } from "gsap/all"
import styled, { css } from "styled-components"

import { clearLocal, getLocal, setLocal } from "utils/localUtils"
import {
  getDefaultVoice,
  getVoiceById,
  getVoices,
  setSpeechRate,
  setVoiceById,
  speak,
  UniversalVoice,
} from "utils/MixedTTS"

gsap.registerPlugin(ScrollToPlugin)

export default function VoiceSetting() {
  const bestVoice = getDefaultVoice()
  const allVoice = getVoices("en")

  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [currentVoice, setCurrentVoice] = useState<UniversalVoice>()

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

  const updateVoice = (voice: UniversalVoice | "default") => {
    if (!open) {
      setOpen(true)
      return
    }
    if (voice === "default") {
      clearLocal("voice")
      setCurrentVoice(undefined)
      setVoiceById(bestVoice.id)
      setSpeechRate(getLocal("speechRate") ?? 1)
    } else {
      setCurrentVoice(voice)
      setLocal("voice", voice.id)
      setVoiceById(voice.id)
      setSpeechRate(getLocal("speechRate") ?? 1)
    }
    const voiceForName = voice === "default" ? bestVoice : voice
    speak(`Hi, my name is ${voiceForName.name.replaceAll(/\([\s\S]+\)/g, "")}.
    This is what I'll sound like when I'm helping you find your way around on the Mine cart Rapid Transit Server.`).catch(
      console.error
    )
  }

  useEffect(() => {
    const localVoice = getLocal("voice")
    const newVoice = localVoice && getVoiceById(localVoice)
    if (newVoice) setCurrentVoice(newVoice)
  }, [bestVoice.id])

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
          Default ({bestVoice.name})
        </Voice>
        <VoicesLabel>Local Voices</VoicesLabel>
        {allVoice
          .filter(x => x.source === "easy-speech")
          .map(v => (
            <Voice
              active={v.id === currentVoice?.id}
              key={v.id}
              onClick={() => {
                updateVoice(v)
              }}
            >
              {v.name}
            </Voice>
          ))}
        <VoicesLabel>Remote Voices</VoicesLabel>
        {allVoice
          .filter(x => x.source === "tik")
          .map(v => (
            <Voice
              active={v.id === currentVoice?.id}
              key={v.id}
              onClick={() => {
                updateVoice(v)
              }}
            >
              <span>{v.name.replace("(Characters)", "")}</span>
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

  // line clamp to 3 lines
  span {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const VoicesLabel = styled.div`
  font-weight: 700;
  padding: 20px 0 10px;
  color: var(--low-contrast-text);
`
