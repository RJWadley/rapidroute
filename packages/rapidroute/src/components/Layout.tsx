import React, { ReactNode, useContext } from "react"

import styled, { createGlobalStyle, css } from "styled-components"

import invertLightness from "utils/invertLightness"

import { darkModeContext } from "./Providers/DarkMode"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const isDark = useContext(darkModeContext)

  return (
    <Wrapper>
      <GlobalStyle isDark={isDark} />
      {children}
    </Wrapper>
  )
}

const lightColors = css`
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

const darkColors = css`
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
`

const GlobalStyle = createGlobalStyle<{ isDark?: boolean }>`
  :root {
    --rapid-red: #f15152;
    --rapid-blue: #416788;
    --rapid-green: #46db5b;
    --rapid-yellow: #ffcb47;

    @media (prefers-color-scheme: dark) {
      ${darkColors}
      ${({ isDark }) => isDark !== undefined && !isDark && lightColors}
    }
    @media (prefers-color-scheme: light) {
      ${lightColors}
      ${({ isDark }) => isDark !== undefined && isDark && darkColors}
    }
  }

  body {
    @media (prefers-color-scheme: dark) {
      background-color: #111;
      ${({ isDark }) =>
        isDark !== undefined && !isDark && "background-color: #fff;"}
    }
    @media (prefers-color-scheme: light) {
      background-color: #fff;
      ${({ isDark }) =>
        isDark !== undefined && isDark && "background-color: #111;"}
    }
    font-family: Inter;
  }
`

const Wrapper = styled.div`
  color: var(--default-text);
  min-height: 100vh;
`
