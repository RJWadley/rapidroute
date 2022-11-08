import React, { useContext, useEffect, useRef } from "react"

import gsap from "gsap"
import styled from "styled-components"

import { darkModeContext } from "components/Providers/DarkMode"
import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"
import media from "utils/media"
import useAnimation from "utils/useAnimation"
import useMedia from "utils/useMedia"

import { NavigationContext } from "../components/Providers/NavigationContext"
import Segment from "../components/Segment"
import Countdown from "./Countdown"
import ExitNavigation from "./ExitNavigation"

export default function NavigationSidebar() {
  const { spokenRoute, preferredRoute } = useContext(NavigationContext)
  const isDark = useContext(darkModeContext)
  const scrollMarker = useRef<HTMLDivElement>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const mobile = useMedia(media.mobile)

  if (isBrowser() && preferredRoute.length === 0) {
    loadRoute("/")
  }

  useNavigation()
  const followedRoute = useFollowedRoute(spokenRoute)

  useEffect(() => {
    if (scrollMarker.current) {
      scrollMarker.current.scrollIntoView({
        behavior: "smooth",
      })
    }
  }, [followedRoute, spokenRoute])

  useAnimation(() => {
    gsap.delayedCall(0.5, () => {
      if (!mobile) return

      const elements = Array.from(
        wrapper.current?.querySelectorAll(".segment-followed") || []
      )

      gsap.to(elements, {
        y: "-70vh",
        scrollTrigger: {
          scroller: wrapper.current,
          trigger: elements[elements.length - 1],
          start: "top 70%",
          end: "bottom 70%",
          scrub: 1,
        },
        stagger: 0.05,
        ease: "power3.in",
      })
    })
    // need extra deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, spokenRoute, followedRoute])

  /**
   * when the mouse goes down on the wrapper, enable pointer events
   * when the mouse goes up on the wrapper, disable pointer events
   *
   * this is so that we can
   *
   */
  useEffect(() => {
    if (!mobile) return undefined
    const onMouseDown = () => {
      gsap.set(wrapper.current, { pointerEvents: "auto" })
    }

    const onMouseUp = () => {
      gsap.set(wrapper.current, { pointerEvents: "none" })
    }

    const handleScroll = (e: WheelEvent) => {
      // if the target is the wrapper, then enable pointer events, otherwise disable them
      if (
        e.target === wrapper.current ||
        (e.target instanceof Node && wrapper.current?.contains(e.target))
      ) {
        gsap.set(wrapper.current, { pointerEvents: "auto" })
      } else {
        gsap.set(wrapper.current, { pointerEvents: "none" })
      }
    }

    const wrapperEl = wrapper.current
    if (!wrapperEl) return undefined

    wrapperEl.addEventListener("mousedown", onMouseDown)
    wrapperEl.addEventListener("mouseup", onMouseUp)
    wrapperEl.addEventListener("touchstart", onMouseDown)
    wrapperEl.addEventListener("touchend", onMouseUp)
    wrapperEl.addEventListener("touchcancel", onMouseUp)
    window.addEventListener("wheel", handleScroll)

    return () => {
      wrapperEl.removeEventListener("mousedown", onMouseDown)
      wrapperEl.removeEventListener("mouseup", onMouseUp)
      wrapperEl.removeEventListener("touchstart", onMouseDown)
      wrapperEl.removeEventListener("touchend", onMouseUp)
      wrapperEl.removeEventListener("touchcancel", onMouseUp)
      window.removeEventListener("wheel", handleScroll)
      gsap.set(wrapperEl, { pointerEvents: "auto" })
    }
  }, [mobile])

  return (
    <Wrapper ref={wrapper}>
      <ExitNavigation />
      {followedRoute.map((segment, i) => {
        return (
          <SegmentWrapper
            active={false}
            key={`${segment.to.uniqueId}-${i + 1}`}
            dark={isDark ?? false}
            className="segment-followed"
          >
            <Segment forceMobile segment={segment} glassy />
          </SegmentWrapper>
        )
      })}
      {spokenRoute.map((segment, i) => {
        return (
          <SegmentWrapper
            active={i === 0}
            key={segment.to.uniqueId}
            dark={isDark ?? false}
          >
            {i === 0 && <div ref={scrollMarker} />}
            <Countdown show={i === 0} type={segment.routes[0]?.type} />
            <Segment forceMobile segment={segment} glassy />
          </SegmentWrapper>
        )
      })}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;

  position: fixed;
  left: 20px;
  bottom: 0;
  top: 0;
  padding-top: 120px;
  padding-bottom: 20px;
  width: 350px;
  z-index: 1;

  // hide scrollbar
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media ${media.mobile} {
    width: calc(100vw - 40px);
    padding-top: 80vh;
  }

  pointer-events: none;
  > * {
    pointer-events: auto;
  }
`

const SegmentWrapper = styled.div<{
  active: boolean
  dark: boolean
}>`
  background-color: ${({ dark }) => (dark ? "#1119" : "#eeea")};
  backdrop-filter: blur(3px);
  border-radius: 30px;
  position: relative;

  padding-top: ${({ active }) => (active ? "50px" : "0px")};
  transition: padding-top 0.5s ease-in-out;

  > div:last-child {
    opacity: 1;
    transform: none;
  }
`
