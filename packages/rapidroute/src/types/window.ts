/// <reference types="react-scripts" />

import { Session } from "utils/localUtils"

declare global {
  interface Window {
    /**
     * special object that can be used to detect if running in safari
     */
    safari: unknown
    /**
     * special object that can be used to detect if running in chrome
     */
    chrome: unknown
    /**
     * special object that can be used to detect if running in firefox
     */
    netscape: unknown
    /**
     * access to session for debugging
     */
    session?: Session
  }
}

export {}
