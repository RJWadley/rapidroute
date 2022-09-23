import React, { useEffect } from "react"
import styled, { keyframes } from "styled-components"
import gsap from "gsap"

export default function Spinner({ show }: { show: boolean }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = gsap.to(wrapperRef.current, {
      opacity: show ? 1 : 0,
      delay: show ? 1 : 0,
    })

    return () => {
      t.kill()
    }
  }, [show])

  return (
    <Loader ref={wrapperRef}>
      <div />
      <div />
      <div />
      <div />
    </Loader>
  )
}

const bounce = keyframes`
    0% {
        transform: translateY(50px) rotate(-225deg);
    }

    50% {
        transform: translateY(-50px) rotate(45deg);
    }

    100% {
        transform: translateY(50px) rotate(-45deg);
    }
`

const Loader = styled.div`
  opacity: 0;
  margin-top: 100px;
  margin-bottom: 100px;
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;

  div {
    display: inline-block;
    width: 40px;
    height: 40px;
    background-color: red;
    animation: ${bounce} 2s infinite;
    animation-timing-function: cubic-bezier(0.66, 0, 0.33, 1);
    border-radius: 10px;
  }

  div:nth-child(1) {
    background: var(--rapid-blue);
    animation-delay: 0s;
  }

  div:nth-child(2) {
    background: var(--rapid-red);
    animation-delay: -1s;
  }

  div:nth-child(3) {
    background: var(--rapid-yellow);
    animation-delay: -1.5s;
  }

  div:nth-child(4) {
    background: var(--rapid-green);
    animation-delay: -0.5s;
  }
`
