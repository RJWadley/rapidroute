import React from "react"

import styled from "styled-components"

export default function ControlsOverlay() {
  return (
    <>
      <Spacer />
      <Wrapper>
        Recent
        <Box>WN44 -> JS2</Box>
        <Box>WN44 -> JS2</Box>
        <Box>WN44 -> JS2</Box>
      </Wrapper>
    </>
  )
}

const Spacer = styled.div`
  // if not using window controls overlay, hide
  display: none;

  // if using window controls overlay, show
  /* @media (display-mode: window-controls-overlay) { */
    display: block;
    height: env(titlebar-area-height, 40px);
  /* } */
`

const Wrapper = styled.div`
  // if not using window controls overlay, hide
  display: none;

  // if using window controls overlay, show
  /* @media (display-mode: window-controls-overlay) { */
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
  /* } */

  background-color: var(--page-background);
  /* border: 1px solid red; */
  padding: 0 15px;
`

const Box = styled.div`
  background-color: var(--default-card-background);
  transition: background-color 0.2s ease-in-out;
  height: 70%;
  min-width: 50px;
  border-radius: 5px;
  display: grid;
  place-items: center;
  padding: 0 10px;

  :hover {
    background-color: var(--mid-background);
  }
`
