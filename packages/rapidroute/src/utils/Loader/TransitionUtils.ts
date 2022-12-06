// need to await within loops since transition utils exists outside of react
/* eslint-disable no-await-in-loop */
import { useEffect } from "react"

import { navigate as gatsbyNavigate } from "gatsby-link"
import gsap from "gsap"

import { pathnameMatches, sleep } from "utils/functions"
import { onUnmount, pageReady } from "utils/pageReady"

import loader, { InternalTransitions, Transitions } from "."
import { getLoaderIsDone } from "./LoaderUtils"

/**
 * A function that runs an animation and returns the duration of that animation in seconds
 */
type Animation = {
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
  const previous = allTransitions[name] || { inAnimation: [], outAnimation: [] }
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
    const previous = allTransitions[name] || {
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
    delete allTransitions[name]
  }
}

let pendingTransition: {
  name: string
  transition?: Transitions | InternalTransitions
} | null = null
let currentAnimation: string | null = null
let waitingForPageToLoad = false
const promisesToAwait: Promise<unknown>[] = []
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
    window.scrollTo(0, 0)
    return
  }

  currentAnimation = to
  promisesToAwait.length = 0

  // if no transition is specified, instant transition
  if (!transition || !allTransitions[transition]) {
    currentAnimation = null
    await navigate(to)

    // we need to wait for the *next* page to load, so wait for unmount, then pageReady
    onUnmount(() => {
      pageReady()
        .then(() => {
          // fire event with detail "none"
          loader.dispatchEvent(
            "transitionEnd",
            new CustomEvent("transitionEnd", { detail: "none" })
          )
          loader.dispatchEvent(
            "anyEnd",
            new CustomEvent("anyEnd", { detail: "none" })
          )
        })
        .catch(console.error)
    })

    return
  }

  // wait for the loader to finish animation before starting the transition
  while (!getLoaderIsDone()) await sleep(100)

  const animationContext = gsap.context(() => {})
  const enterAnimations = transition
    ? allTransitions[transition]?.inAnimation ?? []
    : []

  // run each animation, add it to the context, and get the duration of the longest one
  const entranceDuration = enterAnimations.reduce((duration, animation) => {
    const { callback, duration: animationDuration } = animation
    animationContext.add(callback)
    return Math.max(duration, animationDuration)
  }, 0)

  // dispatch events
  loader.dispatchEvent("anyStart", new CustomEvent("anyStart"))
  loader.dispatchEvent(
    "transitionStart",
    new CustomEvent("transitionStart", { detail: transition })
  )

  // wait for entrance animation to finish
  await sleep(entranceDuration * 1000)

  // if we're on the page we want to go to, we don't wait for a new page load
  if (!pathnameMatches(window.location.pathname, to))
    waitingForPageToLoad = true

  // actually navigate to the page
  await navigate(to, () => {
    animationContext.revert()
  })
  while (waitingForPageToLoad) await sleep(10)
  await Promise.allSettled(promisesToAwait)

  const exitAnimations = transition
    ? allTransitions[transition]?.outAnimation ?? []
    : []

  // run each animation, add it to the context, and get the duration of the longest one
  const exitDuration = exitAnimations.reduce((duration, animation) => {
    const { callback, duration: animationDuration } = animation
    animationContext.add(callback)
    return Math.max(duration, animationDuration)
  }, 0)

  // wait for exit animation to finish
  await sleep(exitDuration * 1000 + 10)

  // dispatch finished events
  loader.dispatchEvent("anyEnd", new CustomEvent("anyEnd"))
  loader.dispatchEvent(
    "transitionEnd",
    new CustomEvent("transitionEnd", { detail: transition })
  )

  // cleanup and reset
  animationContext.revert()
  currentAnimation = null
  if (pendingTransition) {
    // start the next transition if applicable
    loadPage(pendingTransition.name, pendingTransition.transition).catch(
      (e: string) => {
        throw new Error(e)
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
  const isExternal = to.substring(0, 8).includes("//")

  if (isExternal) {
    window.location.href = to

    // if the user presses the back button after navigation, we'll need to cleanup any animations
    setTimeout(() => {
      cleanupFunction?.()
    }, 1000)
  } else {
    await gatsbyNavigate(to)
  }
}

/**
 * tracks when a page is done loading, for use in layout
 */
export function useLoaders() {
  useEffect(() => {
    waitingForPageToLoad = false
  }, [])
}

/**
 * wait for a promise to settle before transitioning to the next page
 * useful for waiting on a file, such as a video, to load
 * @param promise promise to await
 */
export function transitionAwaitPromise(promise: Promise<unknown>) {
  promisesToAwait.push(promise)
}
