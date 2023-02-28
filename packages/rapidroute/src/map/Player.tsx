import { useRef, useState } from "react"

import { gsap } from "gsap"
import { Point, SCALE_MODES, TextStyle, Texture } from "pixi.js"
import { Sprite, Text } from "react-pixi-fiber"

import { session } from "utils/localUtils"
import useAnimation from "utils/useAnimation"
import usePlayerHead from "utils/usePlayerHead"

import { useViewport, useViewportMoved } from "./PixiViewport"
import { Player } from "./worldInfoType"
import { zoomToPlayer } from "./zoomCamera"

const playerText = new TextStyle({
  fill: "white",
  stroke: "black",
  strokeThickness: 3,
  fontFamily: "Inter",
  fontSize: 16,
})
const playerTextHover = new TextStyle({
  fill: "#ffcb47",
  stroke: "black",
  strokeThickness: 3,
  fontFamily: "Inter",
  fontSize: 16,
})

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
  useAnimation(
    () => {
      if (!viewport) return

      gsap.to(headRef.current, {
        x: player.x,
        y: player.z,
        duration: 1.5,
        ease: "linear",
        alpha: 1,
      })
      gsap.to(textRef.current, {
        x: player.x,
        y: player.z,
        duration: 1.5,
        ease: "linear",
        alpha: 1,
      })

      if (player.name === session.followingPlayer) {
        zoomToPlayer(player.x, player.z, viewport)
      }
    },
    [player.name, player.x, player.z, viewport],
    {
      kill: true,
    }
  )

  /**
   * update the head size and name offset
   */
  const onMove = () => {
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
  useViewportMoved(onMove)

  const mouseIn = () => {
    setHover(true)
  }
  const mouseOut = () => {
    setHover(false)
  }
  const click = () => {
    session.followingPlayer = player.name
    session.lastMapInteraction = undefined
    if (viewport) zoomToPlayer(player.x, player.z, viewport)
  }

  if (!playerHead) return null
  return (
    <>
      <Sprite
        texture={Texture.from(playerHead, {
          scaleMode: SCALE_MODES.LINEAR,
        })}
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
        style={hover ? playerTextHover : playerText}
        x={initialPosition.x}
        y={initialPosition.z}
        alpha={0}
        interactive
        cursor="pointer"
        onmouseenter={mouseIn}
        onmouseout={mouseOut}
        onclick={click}
      />
    </>
  )
}
