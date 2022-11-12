/* eslint-disable no-console */
import React, {
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

import gsap from "gsap"
import Flip from "gsap/Flip"
import ScrollToPlugin from "gsap/ScrollToPlugin"
import styled from "styled-components"
import { useDeepCompareEffect } from "use-deep-compare"

import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import media from "utils/media"

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
  useNavigation()

  /**
   * flip in the new segments and out the old
   */
  useEffect(() => {
    const newSlot = activeSlot === "A" ? ".slotA .segment" : ".slotB .segment"
    const oldSlot = activeSlot === "A" ? ".slotB .segment" : ".slotA .segment"

    gsap.set(oldSlot, { display: "block" })
    gsap.set(newSlot, { display: "none" })
    console.log("swap, the old slot, ", oldSlot, "is visible")

    const timeout = setTimeout(() => {
      // make sure initial state is correct
      gsap.set(".slotB", { display: "block" })

      console.log("flipping, the new slot, ", newSlot, "is becoming visible")
      gsap.set(oldSlot, { display: "block" })
      gsap.set(newSlot, { display: "none" })

      const flipState = Flip.getState(".segment")

      gsap.set(oldSlot, { display: "none" })
      gsap.set(newSlot, { display: "block" })

      Flip.from(flipState, {
        targets: ".segment",
        duration: 1,
        absolute: true,
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
  }, [activeSlot])

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

  return (
    <Wrapper>
      <ExitNavigation />
      <div className="slotA">{slotA}</div>
      <div className="slotB" style={{ display: "none" }}>
        {slotB}
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 350px;
  margin: 20px;
  margin-top: 120px;
  margin-bottom: 70vh;

  @media ${media.mobile} {
    margin-top: 70vh;
    width: calc(100vw - 40px);
  }

  pointer-events: none;
  > * {
    pointer-events: auto;
  }

  .slotA {
    .current {
      border: 10px solid red;
    }
    .previous {
      border: 10px solid orange;
    }
  }
  .slotB {
    .current {
      border: 10px solid green;
    }
    .previous {
      border: 10px solid blue;
    }
  }
`
