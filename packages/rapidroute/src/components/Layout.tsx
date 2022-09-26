import React, { ReactNode } from "react"

import styled, { createGlobalStyle } from "styled-components"

import Header from "./Header"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Wrapper>
      <Header />
      <GlobalStyle />
      {children}
    </Wrapper>
  )
}

const GlobalStyle = createGlobalStyle`
  body {
    font-family: Inter;
    --rapid-red: #f15152;
    --rapid-blue: #416788;
    --rapid-green: #46db5b;
    --rapid-yellow: #ffcb47;
  }
`

const Wrapper = styled.div`
  max-width: calc(100vw - 20px);
  margin: 0 auto;
`
