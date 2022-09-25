import React from "react"

import styled, { createGlobalStyle } from "styled-components"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Wrapper>
      <GlobalStyle />
      {children}
    </Wrapper>
  )
}

const GlobalStyle = createGlobalStyle`
  body {
    font-family: Inter;
    --rapid-red: #F15152;
    --rapid-blue: #416788;
    --rapid-green: #46DB5B;
    --rapid-yellow: #FFCB47;
  }
`

const Wrapper = styled.div`
  max-width: calc(100vw - 20px);
  margin: 0 auto;
`
