/// <reference types="react-scripts" />

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
     * true if should show debugging information
     */
    isDebug?: boolean
    /**
     * date of last pan or zoom on map
     */
    lastMapInteraction?: Date
    /**
     * player to follow on map
     */
    following?: string
    /**
     * point of interest to follow on map
     */
    pointOfInterest?: {
      x: number
      z: number
    }
    /**
     * last known location of the user
     */
    lastKnownLocation?: {
      x: number
      z: number
    }
  }
}

export {}
