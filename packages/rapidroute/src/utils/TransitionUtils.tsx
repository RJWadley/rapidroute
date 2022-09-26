/* eslint-disable no-await-in-loop */
import React, { MouseEventHandler, ReactNode, useEffect } from "react"

import { navigate as gatsbyNavigate } from "gatsby-link"
import gsap from "gsap"

import { pathnameMatches, sleep } from "utils/functions"

import { getLoaderIsDone } from "./LoaderUtils"

/**
 * A function that runs an animation and returns the duration of that animation in seconds
 */
type Animation = null | (() => number)

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
 * register a transition that can be run with a transitionLink or by using loadPage.
 * note that the animation functions must return the duration of the animation in seconds
 *
 * @param name the name of the transition
 * @param inAnimation the animation to run before navigating
 * @param outAnimation the animation to run after navigating
 */
export const registerTransition = (
  name: string,
  inAnimation: Animation,
  outAnimation: Animation
) => {
  const previous = allTransitions[name] || { inAnimation: [], outAnimation: [] }
  allTransitions[name] = {
    inAnimation: [...previous.inAnimation, inAnimation],
    outAnimation: [...previous.outAnimation, outAnimation],
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
  inAnimation?: Animation,
  outAnimation?: Animation
) => {
  if (inAnimation && outAnimation) {
    const previous = allTransitions[name] || {
      inAnimation: [],
      outAnimation: [],
    }
    allTransitions[name] = {
      inAnimation: previous.inAnimation.filter(t => t !== inAnimation),
      outAnimation: previous.outAnimation.filter(t => t !== outAnimation),
    }
  } else {
    delete allTransitions[name]
  }
}

let pendingTransition: {
  name: string
  transition?: string
} | null = null
let currentAnimation: string | null = null
let waitingForPageToLoad = false
const promisesToAwait: Promise<any>[] = []
/**
 * load a page, making use of the specified transition
 * @param to page to load
 * @param transition the transition to use
 */
export const loadPage = async (to: string, transition?: string) => {
  // if a transition is already in progress, wait for it to finish before loading the next page
  if (currentAnimation !== null) {
    if (!pathnameMatches(to, currentAnimation))
      pendingTransition = { name: to, transition }
    return
  }

  currentAnimation = to
  promisesToAwait.length = 0

  // if no transition is specified, instant transition
  if (!transition || !allTransitions[transition]) {
    currentAnimation = null
    navigate(to)
    return
  }

  // wait for the loader to finish animation before starting the transition
  while (!getLoaderIsDone()) await sleep(100)

  const animationContext = gsap.context(() => {})
  const enterAnimations = transition
    ? allTransitions[transition]?.inAnimation ?? []
    : []

  // run each animation, add it to the context, and get the duration of the longest one
  const entranceDuration = enterAnimations.reduce((acc, t) => {
    let duration = 0
    animationContext.add(() => {
      duration = t?.() ?? 0
    })
    return Math.max(acc, duration)
  }, 0)

  // wait for entrance animation to finish
  await sleep(entranceDuration * 1000)

  // if we're on the page we want to go to, we don't wait for a new page load
  if (!pathnameMatches(window.location.pathname, to))
    waitingForPageToLoad = true

  // actually navigate to the page
  await navigate(to)
  while (waitingForPageToLoad) await sleep(10)
  await Promise.allSettled(promisesToAwait)

  const exitAnimations = transition
    ? allTransitions[transition]?.outAnimation ?? []
    : []

  // run each animation, add it to the context, and get the duration of the longest one
  animationContext.revert()
  const exitDuration = exitAnimations.reduce((acc, t) => {
    let duration = 0
    animationContext.add(() => {
      duration = t?.() ?? 0
    })
    return Math.max(acc, duration)
  }, 0)

  // wait for exit animation to finish
  await sleep(exitDuration * 1000 + 10)

  // cleanup and reset
  animationContext.revert()
  currentAnimation = null
  if (pendingTransition) {
    // start the next transition if applicable
    loadPage(pendingTransition.name, pendingTransition.transition)
    pendingTransition = null
  }
}

/**
 * navigate to an external or internal link without a transition
 * @param to the link to navigate to
 */
export const navigate = (to: string) => {
  const isExternal = to.substring(0, 8).includes("//")

  if (isExternal) {
    window.location.href = to

    // if the user presses the back button after navigation, we'll need to reload the page to clear the transition
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } else gatsbyNavigate(to)
}

/**
 * tracks when a page is done loading, for use in layout
 */
export function usePageLoad() {
  useEffect(() => {
    waitingForPageToLoad = false
  }, [])
}

/**
 * wait for a promise to settle before transitioning to the next page
 * useful for waiting on a file, such as a video, to load
 * @param promise promise to await
 */
export function transitionAwaitPromise(promise: Promise<any>) {
  promisesToAwait.push(promise)
}

interface TransitionLinkProps {
  /**
   * the page to navigate to when clicked
   */
  to: string
  /**
   * the transition to use when navigating
   */
  transition?: string
  openInNewTab?: boolean
  children: ReactNode
  className?: string
}

/**
 * a link that navigates when clicked, using the specified transition
 * @returns
 */
export function TransitionLink({
  to,
  transition = undefined,
  openInNewTab = false,
  children,
  className = "",
}: TransitionLinkProps) {
  const handleClick: MouseEventHandler = e => {
    e.preventDefault()

    if (openInNewTab) {
      window.open(to, "_blank")
    } else loadPage(to, transition)
  }

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
