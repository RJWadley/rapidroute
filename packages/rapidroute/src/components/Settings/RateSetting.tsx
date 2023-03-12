import { useEffect, useState } from "react"

import styled from "styled-components"

import { getLocal, setLocal } from "utils/localUtils"
import { setSpeechRate, setVoiceById, speak } from "utils/MixedTTS"

export default function RateSetting() {
  const [rate, setRate] = useState(1)

  useEffect(() => {
    const newRate = getLocal("speechRate")
    setRate(newRate ?? 1)
  }, [])

  return (
    <Wrapper>
      <div>Speech Rate</div>
      <Slider
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={rate}
        onChange={e => {
          setRate(parseFloat(e.target.value))
          setLocal("speechRate", parseFloat(e.target.value))
          setSpeechRate(parseFloat(e.target.value))
          setVoiceById(getLocal("voice") ?? "")
            .then(() => {
              speak("This is how fast I'll speak to you.").catch(console.error)
            })
            .catch(console.error)
        }}
      />
      <RateDisplay>{rate}</RateDisplay>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  position: relative;
  align-items: center;
  gap: 10px;
  background: var(--mid-background);
  border-radius: 20px;
  padding: 20px;
`

const Slider = styled.input`
  display: block;
  background: var(--dark-background);
  border-radius: 10px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    background: var(--button-green);
    cursor: pointer;
    border-radius: 10px;
  }

  &::-moz-range-thumb {
    width: 25px;
    height: 25px;
    background: var(--button-green);
    cursor: pointer;
    border-radius: 10px;
  }
`

const RateDisplay = styled.div`
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
`
