/* eslint-disable no-console */
import { ReactNode, useContext, useEffect, useState } from "react"

import gsap from "gsap"
import Flip from "gsap/Flip"
import ScrollToPlugin from "gsap/ScrollToPlugin"
import ScrollTrigger from "gsap/ScrollTrigger"
import styled from "styled-components"
import { useDeepCompareEffect } from "use-deep-compare"

import { NavigationContext } from "components/Providers/NavigationContext"
import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import media from "utils/media"
import useMedia from "utils/useMedia"

import Countdown from "./Countdown"
import ExitNavigation from "./ExitNavigation"
import NavigationSegment from "./NavigationSegment"

gsap.registerPlugin(ScrollToPlugin, Flip)

export default function NavigationSidebar() {
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A")
  const [slotA, setSlotA] = useState<ReactNode>(null)
  const [slotB, setSlotB] = useState<ReactNode>(null)
  const { spokenRoute, headerHeight } = useContext(NavigationContext)
  const followedRoute = useFollowedRoute(spokenRoute)
  const mobile = useMedia(media.mobile)
  useNavigation()

  /**
   * flip in the new segments and out the old
   */
  useEffect(() => {
    // debounce the animation to prevent it from running multiple times
    const debounced = setTimeout(() => {
      const newSlot = activeSlot === "A" ? ".slotA .segment" : ".slotB .segment"
      const oldSlot = activeSlot === "A" ? ".slotB .segment" : ".slotA .segment"

      // kill all scroll triggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())

      // save the scroll position to prevent the page from jumping when the contents change
      const initialScroll = window.scrollY

      // make both wrappers visible so that Flip can see everything
      gsap.set(".slotA, .slotB", { display: "block" })

      // "First" state
      gsap.set(oldSlot, { display: "block" })
      gsap.set(newSlot, { display: "none" })
      const flipState = Flip.getState(".segment")

      // Last state
      gsap.set(oldSlot, { display: "none" })
      gsap.set(newSlot, { display: "block" })

      // Invert and Play
      window.scrollTo(0, initialScroll)
      Flip.from(flipState, {
        targets: ".segment",
        duration: 1,
        absoluteOnLeave: true,
        stagger: 0.1,
        toggleClass: "flipping",
        // animate in from the left
        onEnter: el =>
          gsap.fromTo(el, { xPercent: -150 },
            { xPercent: 0, duration: 1, stagger: 0.1 }),
        // animate out to the right
        onLeave: el =>
          gsap.fromTo(el, { xPercent: 0 },
            { xPercent: -150, duration: 1, stagger: 0.1 }),
        // hide the old slot after the animation is done
        onComplete: () => {
          if (activeSlot === "A") {
            setSlotB(null)
            gsap.set(".slotB", { display: "none" })
          } else {
            setSlotA(null)
            gsap.set(".slotA", { display: "none" })
          }
        },
      })
    }, 1000)

    return () => {
      clearTimeout(debounced)
    }
  }, [activeSlot])

  /**
   * update the current slot when the route changes
   */
  useDeepCompareEffect(() => {
    const debounced = setTimeout(() => {
      const newFollowed = followedRoute.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="previous"
          index={i}
          key={`previous${segment.from.uniqueId}-${segment.to.uniqueId}`}
        />
      ))
      const newSpoken = spokenRoute.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="current"
          index={i}
          key={`current${segment.from.uniqueId}-${segment.to.uniqueId}`}
        />
      ))

      const newContent = (
        <>
          {newFollowed}
          <Countdown type={spokenRoute[0]?.routes[0]?.type} />
          {newSpoken}
        </>
      )

      setActiveSlot(previousSlot => {
        if (previousSlot === "A") {
          setSlotB(newContent)
          return "B"
        }
        setSlotA(newContent)
        return "A"
      })
    }, 100)
    return () => clearTimeout(debounced)
  }, [followedRoute, spokenRoute])

  /**
   * scroll to the current segment
   */
  useEffect(() => {
    const searchClass =
      activeSlot === "A" ? ".slotA .current" : ".slotB .current"
    const elementToScrollTo = document.querySelector(searchClass)
    const getMobileScrollPoint = () =>
      // taller than 40 % of the screen?
      (elementToScrollTo?.clientHeight ?? 0) > window.innerHeight * 0.4 - 20 ||
      // matches :last-child?
      elementToScrollTo?.matches(":last-child")
        ? // if yes, position relative to bottom of screen
          window.innerHeight - (elementToScrollTo?.clientHeight ?? 0) - 20
        : // otherwise, position relative to the 60% mark
          window.innerHeight * 0.6

    const getOverlayOffset = () => {
      if ("windowControlsOverlay" in navigator) {
        if (navigator.windowControlsOverlay?.visible) {
          const { height } =
            navigator.windowControlsOverlay.getTitlebarAreaRect()
          return height
        }
      }
      return 0
    }

    // gsap scroll plugin
    const updateScroll = () => {
      if (elementToScrollTo)
        gsap.to(window, {
          duration: 5,
          scrollTo: {
            y: elementToScrollTo,
            offsetY:
              (mobile ? getMobileScrollPoint() : 90 + headerHeight) +
              getOverlayOffset(),
            autoKill: true,
          },
          ease: "power3.inOut",
        })
    }
    const timeout = setTimeout(updateScroll, 3000)
    const interval = setInterval(updateScroll, 15000)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [activeSlot, headerHeight, mobile])

  return (
    <Wrapper>
      <ExitNavigation />
      <BeforeSpacer navHeight={headerHeight} />
      <div className="slotA">{slotA}</div>
      <div className="slotB" style={{ display: "none" }}>
        {slotB}
      </div>
      <AfterSpacer />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 350px;
  margin: 0 20px;

  @media ${media.mobile} {
    width: calc(100vw - 40px);
  }

  pointer-events: none;
  > * {
    pointer-events: auto;
  }

  /* // Debug Colors
  .slotA {
    .previous {
      border: 10px solid red;
    }
    .current {
      border: 10px solid orange;
    }
  }
  .slotB {
    .previous {
      border: 10px solid green;
    }
    .current {
      border: 10px solid blue;
    }
  } */

  --extra-small: 12px;
  --small: 12px;
  --medium: 16px;
  --large: 24px;
  --extra-large: 32px;
  --symbol: 40px;
`

const BeforeSpacer = styled.div<{
  navHeight: number
}>`
  height: calc(${props => props.navHeight}px + 20px);
  @media ${media.mobile} {
    height: 70vh;
  }
`

const AfterSpacer = styled.div`
  height: 80vh;
`
