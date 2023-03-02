import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { gsap } from "gsap"
import { Point, Texture } from "pixi.js"
import { Sprite, Text } from "react-pixi-fiber"

import { getLocal, session } from "utils/localUtils"
import usePlayerHead from "utils/usePlayerHead"

import useHideOverlapping from "./hideOverlapping"
import { useViewport, useViewportMoved } from "./PixiViewport"
import { regular, regularHover } from "./textStyles"
import { Player } from "./worldInfoType"
import { zoomToPlayer } from "./zoomCamera"

export default function MapPlayer({ player }: { player: Player }) {
  const playerHead = usePlayerHead(player.name)
  const viewport = useViewport()
  const headRef = useRef<Sprite>(null)
  const textRef = useRef<Text>(null)
  const [initialPosition] = useState({ x: player.x, z: player.z })
  const [hover, setHover] = useState(false)

  /**
   * animate the player's head and name to the player's position
   */
  useLayoutEffect(() => {
    if (!viewport) return

    const tweens = [
      gsap.to(headRef.current, {
        x: player.x,
        y: player.z,
        duration: 1.5,
        ease: "linear",
        alpha: 1,
      }),
      gsap.to(textRef.current, {
        x: player.x,
        y: player.z,
        duration: 1.5,
        ease: "linear",
        alpha: 1,
      }),
    ]

    return () => {
      tweens.forEach(tween => {
        tween.kill()
      })
    }
  }, [player.name, player.x, player.z, viewport])

  /**
   * follow the player if they are being followed
   * and update their position for the navigator
   */
  useEffect(() => {
    if (player.name === session.followingPlayer && viewport) {
      zoomToPlayer(player.x, player.z, viewport)
    }
    if (
      player.account.toLowerCase() ===
      getLocal("selectedPlayer")?.toString().toLowerCase()
    ) {
      session.lastKnownLocation = { x: player.x, z: player.z }
    }
  }, [player, viewport])

  /**
   * update the head size and name offset
   */
  const updatePlayerHeadSize = () => {
    if (!viewport) return
    const blocksPerPixel =
      viewport.screenWidthInWorldPixels / viewport.screenWidth
    const preferredSize = 20 * blocksPerPixel
    const size = Math.max(8, preferredSize)
    gsap.set(headRef.current, {
      width: size,
      height: size,
    })
    if (textRef.current) {
      textRef.current.scale = new Point(
        1 / viewport.scale.x,
        1 / viewport.scale.y
      )
      const newAdjustment = (8 - Math.min(8, preferredSize)) * 0.2
      textRef.current.anchor = new Point(0.5, 1.5 + newAdjustment ** 3)
    }
  }
  useViewportMoved(updatePlayerHeadSize)

  useHideOverlapping({
    item: textRef,
    name: player.name,
    priority: "players",
    allowHide: false,
  })
  useHideOverlapping({
    item: headRef,
    name: player.name,
    priority: "players",
    allowHide: false,
  })

  const mouseIn = () => {
    setHover(true)
  }
  const mouseOut = () => {
    setHover(false)
  }
  const click = () => {
    setHover(false)
    session.followingPlayer = player.name
    session.lastMapInteraction = undefined
    if (viewport) zoomToPlayer(player.x, player.z, viewport)
  }

  if (!playerHead) return null
  return (
    <>
      <Sprite
        texture={Texture.from(playerHead)}
        ref={headRef}
        anchor={0.5}
        x={initialPosition.x}
        y={initialPosition.z}
        alpha={0}
        interactive
        cursor="pointer"
        onmouseenter={mouseIn}
        onmouseout={mouseOut}
        onclick={click}
      />
      <Text
        anchor="0.5, 1.5"
        text={player.name}
        ref={textRef}
        style={hover ? regularHover : regular}
        x={initialPosition.x}
        y={initialPosition.z}
        alpha={0}
        interactive
        cursor="pointer"
        onmouseenter={mouseIn}
        onmouseout={mouseOut}
        onclick={click}
        ontouchstart={click}
      />
    </>
  )
}
