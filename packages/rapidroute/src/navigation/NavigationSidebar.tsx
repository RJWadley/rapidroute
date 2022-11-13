/* eslint-disable no-console */
import React, { ReactNode, useContext, useEffect, useState } from "react"

import gsap from "gsap"
import Flip from "gsap/Flip"
import ScrollToPlugin from "gsap/ScrollToPlugin"
import ScrollTrigger from "gsap/ScrollTrigger"
import styled from "styled-components"
import { useDeepCompareEffect } from "use-deep-compare"

import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import media from "utils/media"
import useMedia from "utils/useMedia"

import { NavigationContext } from "../components/Providers/NavigationContext"
import ExitNavigation from "./ExitNavigation"
import NavigationSegment from "./NavigationSegment"

gsap.registerPlugin(ScrollToPlugin, Flip)

export default function NavigationSidebar() {
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A")
  const [slotA, setSlotA] = useState<ReactNode>(null)
  const [slotB, setSlotB] = useState<ReactNode>(null)
  const { spokenRoute } = useContext(NavigationContext)
  const followedRoute = useFollowedRoute(spokenRoute)
  const mobile = useMedia(media.mobile)
  useNavigation()

  /**
   * flip in the new segments and out the old
   */
  useEffect(() => {
    const newSlot = activeSlot === "A" ? ".slotA .segment" : ".slotB .segment"
    const oldSlot = activeSlot === "A" ? ".slotB .segment" : ".slotA .segment"

    gsap.set(oldSlot, { display: "block" })
    gsap.set(newSlot, { clearProps: "all" })
    gsap.set(newSlot, { display: "none" })
    console.log("swap, the old slot, ", oldSlot, "is visible")

    const timeout = setTimeout(() => {
      // make sure initial state is correct
      gsap.set(".slotB", { display: "block" })

      // kill all scroll triggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())

      const initialScroll = window.scrollY

      console.log("initial scroll", initialScroll)

      console.log("flipping, the new slot, ", newSlot, "is becoming visible")
      gsap.set(oldSlot, { display: "block" })
      gsap.set(newSlot, { display: "none" })

      const flipState = Flip.getState(".segment")

      gsap.set(oldSlot, { display: "none" })
      gsap.set(newSlot, { display: "block" })

      // restore scroll position
      window.scrollTo(0, initialScroll)

      Flip.from(flipState, {
        targets: ".segment",
        duration: 1,
        absoluteOnLeave: true,
        stagger: 0.1,
        onEnter: el =>
          gsap.fromTo(el, { xPercent: -150 },
            { xPercent: 0, duration: 1, stagger: 0.1 }),
        onLeave: el =>
          gsap.fromTo(el, { xPercent: 0 },
            { xPercent: -150, duration: 1, stagger: 0.1 }),
      })
    }, 1000)

    return () => {
      clearTimeout(timeout)
    }
  }, [activeSlot, mobile])

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
          {newSpoken}
        </>
      )

      setActiveSlot(previousSlot => {
        if (previousSlot === "A") {
          setSlotB(newContent)
          console.log("updating inactive slot B")
          return "B"
        }
        setSlotA(newContent)
        console.log("updating inactive slot A")
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
      // taller than 30 % of the screen?
      (elementToScrollTo?.clientHeight ?? 0) > window.innerHeight * 0.4 - 20
        ? // if yes, position relative to bottom of screen
          window.innerHeight - (elementToScrollTo?.clientHeight ?? 0) - 20
        : // otherwise, position relative to middle
          window.innerHeight * 0.6

    // gsap scroll plugin
    const updateScroll = () => {
      if (elementToScrollTo)
        gsap.to(window, {
          duration: 5,
          scrollTo: {
            y: elementToScrollTo,
            offsetY: mobile ? getMobileScrollPoint() : 120,
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
  }, [activeSlot, mobile])

  return (
    <Wrapper>
      <ExitNavigation />
      <BeforeSpacer />
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

  /* .slotA {
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
`

const BeforeSpacer = styled.div`
  height: 120px;
  @media ${media.mobile} {
    height: 70vh;
  }
`

const AfterSpacer = styled.div`
  height: 80vh;
`
