import React from "react"
import { createGlobalStyle } from "styled-components"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <GlobalStyle />
      {children}
    </div>
  )
}

const GlobalStyle = createGlobalStyle`
  body {
    font-family: Inter;
  }
`
