// need to await within loops since transition utils exists outside of react

import { navigate as gatsbyNavigate } from "@reach/router"
import gsap from "gsap"
import { startTransition, useEffect } from "react"
import { pathnameMatches, sleep } from "utils/functions"
import { pageReady, pageUnmounted } from "utils/pageReady"

import loader, {
  InternalTransitions,
  promisesToAwait,
  recursiveAllSettled,
  Transitions,
} from "."

/**
 * A function that runs an animation and returns the duration of that animation in seconds
 */
interface Animation {
  callback: VoidFunction
  duration: number
}

/**
 * Object tracking all the registered transitions
 */
const allTransitions: Record<
  string,
  {
    inAnimation: Animation[]
    outAnimation: Animation[]
  }
> = {}

/**
 * register a transition that can be run with a UniversalLink or by using loadPage.
 * note that the animation functions must return the duration of the animation in seconds
 *
 * @param name the name of the transition
 * @param inAnimation the animation to run before navigating
 * @param outAnimation the animation to run after navigating
 */
export const registerTransition = (
  name: Exclude<Transitions, InternalTransitions | undefined>,
  details: {
    in: VoidFunction
    out: VoidFunction
    inDuration: number
    outDuration: number
  }
) => {
  const {
    in: inAnimation,
    out: outAnimation,
    inDuration,
    outDuration,
  } = details
  const previous = allTransitions[name] ?? { inAnimation: [], outAnimation: [] }
  allTransitions[name] = {
    inAnimation: [
      ...previous.inAnimation,
      { callback: inAnimation, duration: inDuration },
    ],
    outAnimation: [
      ...previous.outAnimation,
      { callback: outAnimation, duration: outDuration },
    ],
  }
}

/**
 * unregister a previously registered transition, such as when a transition component unmounts
 *
 * if inAnimation and outAnimation are not provided, all registered transitions with the given name will be unregistered
 *
 * @param name the name of the transition to unmount
 * @param inAnimation if provided, only unregister this specific animation
 * @param outAnimation if provided, only unregister this specific animation
 */
export const unregisterTransition = (
  name: string,
  callbacksToRemove?: VoidFunction[]
) => {
  if (callbacksToRemove) {
    const previous = allTransitions[name] ?? {
      inAnimation: [],
      outAnimation: [],
    }
    allTransitions[name] = {
      inAnimation: previous.inAnimation.filter(
        ({ callback }) => !callbacksToRemove.includes(callback)
      ),
      outAnimation: previous.outAnimation.filter(
        ({ callback }) => !callbacksToRemove.includes(callback)
      ),
    }
  } else {
    allTransitions[name] = { inAnimation: [], outAnimation: [] }
  }
}

let pendingTransition: {
  name: string
  transition?: Transitions | InternalTransitions
} | null = null
let currentAnimation: string | null = null
/**
 * load a page, making use of the specified transition
 * @param to page to load
 * @param transition the transition to use
 */
export const loadPage = async (
  to: string,
  transition?: Transitions | InternalTransitions
) => {
  // if a transition is already in progress, wait for it to finish before loading the next page
  if (currentAnimation !== null) {
    if (!pathnameMatches(to, currentAnimation))
      pendingTransition = { name: to, transition }
    return
  }

  // if we're already on the page we're trying to load, don't do anything, just scroll to the top
  if (pathnameMatches(to, window.location.pathname)) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    loader.dispatchEvent("scrollToTop")
    return
  }

  currentAnimation = to

  // if no transition is specified, instant transition
  if (!transition || !allTransitions[transition]) {
    currentAnimation = null
    await navigate(to)

    window.scrollTo(0, 1)
    loader.dispatchEvent("transitionEnd", "none")
    loader.dispatchEvent("anyEnd", "none")

    return
  }

  const animationContext = gsap.context(() => {
    // we must pass a function to gsap.context for it to initialize properly
  })
  const enterAnimations = allTransitions[transition]?.inAnimation ?? []

  // run each animation, add it to the context, and get the duration of the longest one
  let entranceDuration = 0
  for (const animation of enterAnimations) {
    const { callback, duration: animationDuration } = animation
    animationContext.add(callback)
    entranceDuration = Math.max(entranceDuration, animationDuration)
  }

  // dispatch events
  loader.dispatchEvent("anyStart", transition)
  loader.dispatchEvent("transitionStart", transition)

  // wait for entrance animation to finish
  await sleep(entranceDuration * 1000)

  // actually navigate to the page
  await navigate(to, () => {
    animationContext.revert()
  })
  window.scrollTo(0, 1)

  promisesToAwait.push(sleep(100))
  await recursiveAllSettled(promisesToAwait)

  const exitAnimations = allTransitions[transition]?.outAnimation ?? []

  // run each animation, add it to the context, and get the duration of the longest one
  let exitDuration = 0
  for (const animation of exitAnimations) {
    const { callback, duration: animationDuration } = animation
    animationContext.add(callback)
    exitDuration = Math.max(exitDuration, animationDuration)
  }

  // wait for exit animation to finish
  await sleep(exitDuration * 1000 + 10)

  // dispatch finished events
  loader.dispatchEvent("anyEnd", transition)
  loader.dispatchEvent("transitionEnd", transition)

  // cleanup and reset
  animationContext.revert()
  currentAnimation = null
  if (pendingTransition) {
    // start the next transition if applicable
    loadPage(pendingTransition.name, pendingTransition.transition).catch(
      (error: string) => {
        throw new Error(error)
      }
    )
    pendingTransition = null
  }
}

/**
 * navigate to an external or internal link without a transition
 * @param to the link to navigate to
 * @param cleanupFunction a function to reset the page to its original state (if back button is pressed after external link)
 */
export const navigate = async (to: string, cleanupFunction?: VoidFunction) => {
  const isExternal = to.slice(0, 8).includes("//")

  if (isExternal) {
    window.open(to)

    // if the user presses the back button after navigation, we'll need to cleanup any animations
    setTimeout(() => {
      cleanupFunction?.()
    }, 1000)
  } else {
    startTransition(() => {
      gatsbyNavigate(to).catch(error => {
        console.error(error)
        window.open(to)
      })
    })
    // we need to wait for the *next* page to load, so wait for unmount, then pageReady
    await pageUnmounted()
    await pageReady()
  }
}

/**
 * tracks when a page is done loading, for use in layout
 * also handles bugs with back/forward buttons
 */
export function useBackButton() {
  useEffect(() => {
    const handleBackButton = () => {
      ;(async () => {
        loader.dispatchEvent("initialStart")
        loader.dispatchEvent("anyStart", "none")
        await pageUnmounted()
        await pageReady()
        window.scrollTo(0, 1)
        await sleep(500)
        loader.dispatchEvent("transitionEnd", "none")
        loader.dispatchEvent("anyEnd", "none")
      })().catch(console.error)
    }
    window.addEventListener("popstate", handleBackButton)
    return () => window.removeEventListener("popstate", handleBackButton)
  })
}