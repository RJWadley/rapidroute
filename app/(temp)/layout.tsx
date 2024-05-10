import "the-new-css-reset/css/reset.css"

import { styled } from "@linaria/react"
import Providers from "(temp)/components/Providers"
import { Inter } from "next/font/google"

import invertLightness from "./utils/colors/invertLightness"
import { css } from "./utils/css"
import media from "./utils/media"

export const metadata = {
  title: "MRT RapidRoute",
  description: "A route finder for the Minecart Rapid Transit Server",
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <Document lang="en" className={inter.className}>
        <body>{children}</body>
      </Document>
    </Providers>
  )
}

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

const Document = styled.html`
  background-color: var(--page-background);
  font-family: Inter, Arial, sans-serif;
  color: var(--default-text);

  --rapid-red: #f15152;
  --rapid-blue: #416788;
  --rapid-green: #46db5b;
  --rapid-yellow: #ffcb47;
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

  @media (prefers-color-scheme: dark) {
    ${darkColors}
    &.light {
      ${lightColors}
    }
  }

  @media (prefers-color-scheme: light) {
    ${lightColors}
    &.dark {
      ${darkColors}
    }
  }

  /* restore default focus states for elements that need them */
  *:focus-visible {
    outline: 2px solid #2f6fdb88;
  }
`
