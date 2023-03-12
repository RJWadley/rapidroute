import { ReactNode, useContext } from "react"

import styled, { createGlobalStyle, css } from "styled-components"

import invertLightness from "utils/invertLightness"
import { useLoaders } from "utils/Loader/TransitionUtils"
import media from "utils/media"
import { usePageReady } from "utils/pageReady"

import { darkModeContext } from "./Providers/DarkMode"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const isDark = useContext(darkModeContext)
  usePageReady()
  useLoaders()

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
  --page-background: #fff;

  --low-contrast-text: #555;
  --default-text: #333;
  --button-green: #7cd48a;
  --background-green: #cff4d5;
  --button-red: #ffbcba;

  /* invert versions */
  --invert-default-card-background: ${invertLightness("#eee")};
  --invert-mid-background: ${invertLightness("#ddd")};
  --invert-dark-background: ${invertLightness("#ccc")};

  --invert-low-contrast-text: ${invertLightness("#555")};
  --invert-default-text: ${invertLightness("#333")};
  --invert-button-green: ${invertLightness("#7cd48a")};
  --invert-background-green: ${invertLightness("#cff4d5")};
  --invert-button-red: ${invertLightness("#FFBCBA")};

  /* glassy */
  --glassy-default-card-background: #eeec;
  --glassy-mid-background: #dddc;
  --glassy-dark-background: #cccc;
`

const darkColors = css`
  --default-card-background: #333;
  --mid-background: #444;
  --dark-background: #555;
  --page-background: #111;

  --low-contrast-text: #aaa;
  --default-text: #ccc;
  --button-green: #266a31;
  --background-green: #07380f;
  --button-red: #ff5c5c;

  /* invert versions */
  --invert-default-card-background: ${invertLightness("#333")};
  --invert-mid-background: ${invertLightness("#444")};
  --invert-dark-background: ${invertLightness("#555")};

  --invert-low-contrast-text: ${invertLightness("#aaa")};
  --invert-default-text: ${invertLightness("#ccc")};
  --invert-button-green: ${invertLightness("#266a31")};
  --invert-background-green: ${invertLightness("#07380f")};
  --invert-button-red: ${invertLightness("#ff5c5c")};

  /* glassy */
  --glassy-default-card-background: #333c;
  --glassy-mid-background: #444c;
  --glassy-dark-background: #555c;
`

const GlobalStyle = createGlobalStyle`${css<{ isDark?: boolean }>`
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

    --extra-small: 16px;
    --small: 20px;
    --medium: 24px;
    --large: 32px;
    --extra-large: 48px;
    --symbol: 60px;

    @media ${media.mobile} {
      --extra-small: 16px;
      --small: 18px;
      --medium: 20px;
      --large: 24px;
      --extra-large: 32px;
      --symbol: 40px;
    }
  }

  html {
    background-color: var(--page-background);
    font-family: Inter, Arial, sans-serif;
  }
`}`

const Wrapper = styled.div`
  color: var(--default-text);
  min-height: 100vh;
`
