import React from "react"

import styled from "styled-components"

interface ControlsOverlayProps {
  children: React.ReactNode
  fillBackground?: boolean
}

export default function ControlsOverlay({
  children,
  fillBackground = true,
}: ControlsOverlayProps) {
  return (
    <>
      <Spacer />
      <Wrapper fillBackground={fillBackground}>{children}</Wrapper>
    </>
  )
}

const Spacer = styled.div`
  // if not using window controls overlay, hide
  display: none;

  // if using window controls overlay, show
  @media (display-mode: window-controls-overlay) {
    display: block;
    height: env(titlebar-area-height, 40px);
  }
`

const Wrapper = styled.div<{ fillBackground: boolean }>`
  // if not using window controls overlay, hide
  display: none;

  // if using window controls overlay, show
  @media (display-mode: window-controls-overlay) {
    display: flex;
    align-items: center;
    gap: 10px;
    position: fixed;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: env(titlebar-area-width, 100vw);
    height: env(titlebar-area-height, 40px);
    z-index: 9999999;
    -webkit-app-region: drag;
    background-color: ${({ fillBackground }) =>
      fillBackground ? "#111" : "transparent"};
  }
`
