import React, { ReactNode, useContext } from "react"

import styled, { createGlobalStyle, css } from "styled-components"

import invertLightness from "utils/invertLightness"

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
    background-color: ${({ isDark }) => (isDark ? "#111" : "white")};
    font-family: Inter;
  }

  :root {
    --rapid-red: #f15152;
    --rapid-blue: #416788;
    --rapid-green: #46db5b;
    --rapid-yellow: #ffcb47;

    ${({ isDark }) =>
      !isDark
        ? css`
            --default-card-background: #eee;
            --mid-background: #ddd;
            --dark-background: #ccc;

            --low-contrast-text: #555;
            --default-text: #333;
            --button-green: #7cd48a;
            --background-green: #cff4d5;

            /* invert versions */
            --invert-default-card-background: ${invertLightness("#eee")};
            --invert-mid-background: ${invertLightness("#ddd")};
            --invert-dark-background: ${invertLightness("#ccc")};

            --invert-low-contrast-text: ${invertLightness("#555")};
            --invert-default-text: ${invertLightness("#333")};
            --invert-button-green: ${invertLightness("#7cd48a")};
            --invert-background-green: ${invertLightness("#cff4d5")};
          `
        : css`
            --default-card-background: #333;
            --mid-background: #444;
            --dark-background: #555;

            --low-contrast-text: #aaa;
            --default-text: #ccc;
            --button-green: #266a31;
            --background-green: #07380f;

            /* invert versions */
            --invert-default-card-background: ${invertLightness("#333")};
            --invert-mid-background: ${invertLightness("#444")};
            --invert-dark-background: ${invertLightness("#555")};

            --invert-low-contrast-text: ${invertLightness("#aaa")};
            --invert-default-text: ${invertLightness("#ccc")};
            --invert-button-green: ${invertLightness("#266a31")};
            --invert-background-green: ${invertLightness("#07380f")};
          `};
  }
`

const Wrapper = styled.div`
  max-width: calc(100vw - 20px);
  margin: 0 auto;
  color: var(--default-text);
`
