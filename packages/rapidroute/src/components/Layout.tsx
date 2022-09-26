import React, { ReactNode, useContext } from "react"

import styled, { createGlobalStyle, css } from "styled-components"

import Header from "./Header"
import { darkModeContext } from "./Providers/DarkMode"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const isDark = useContext(darkModeContext)

  return (
    <Wrapper>
      <Header />
      <GlobalStyle isDark={isDark} />
      {children}
    </Wrapper>
  )
}

const GlobalStyle = createGlobalStyle<{ isDark: boolean }>`
  body {
    background-color: ${({ isDark }) => (isDark ? "black" : "white")};

    font-family: Inter;
    --rapid-red: #f15152;
    --rapid-blue: #416788;
    --rapid-green: #46db5b;
    --rapid-yellow: #ffcb47;

    background-color: ${({ isDark }) =>
      !isDark
        ? css`
            --default-card-background: #eee;
            --mid-background: #ddd;
            --dark-background: #ccc;

            --low-contrast-text: #555;
            --default-text: #333;
            --button-green: #7cd48a;
            --background-green: #cff4d5;
          `
        : css`
            --default-card-background: #333;
            --mid-background: #444;
            --dark-background: #555;

            --low-contrast-text: #aaa;
            --default-text: #ccc;
            --button-green: #7cd48a;
            --background-green: #cff4d5;
          `};
  }
`

const Wrapper = styled.div`
  max-width: calc(100vw - 20px);
  margin: 0 auto;
  color: var(--default-text);
`
