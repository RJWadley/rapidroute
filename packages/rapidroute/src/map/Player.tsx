import { useEffect, useRef } from "react"

import { gsap } from "gsap"
import { Point, SCALE_MODES, TextStyle, Texture } from "pixi.js"
import { Sprite, Text } from "react-pixi-fiber"

import useAnimation from "utils/useAnimation"
import usePlayerHead from "utils/usePlayerHead"

import { useViewport, useViewportMoved } from "./PixiViewport"
import { Player } from "./worldInfoType"

const playerText = new TextStyle({
  fill: "white",
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
  const manualVerticalAdjustment = useRef(0)

  /**
   * animate the player's head and name to the player's position
   */
  useAnimation(
    () => {
      if (!viewport) return

      gsap.to(headRef.current, {
        x: player.x,
        y: player.z,
        duration: 2,
        ease: "linear",
      })
      gsap.to(textRef.current, {
        x: player.x,
        y: player.z + manualVerticalAdjustment.current,
        duration: 2,
        ease: "linear",
      })
    },
    [player.x, player.z, viewport],
    {
      kill: true,
    }
  )

  /**
   * update the head size
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
      const previousAdjustment = manualVerticalAdjustment.current
      manualVerticalAdjustment.current = (8 - Math.min(8, preferredSize)) * -0.6
      const diff = manualVerticalAdjustment.current - previousAdjustment
      if (textRef.current.y) textRef.current.y += diff
    }
  }
  useViewportMoved(onMove)

  if (!playerHead) return null
  return (
    <>
      <Sprite
        texture={Texture.from(playerHead, {
          scaleMode: SCALE_MODES.LINEAR,
        })}
        ref={headRef}
        anchor={0.5}
      />
      <Text
        anchor="0.5, 1.5"
        text={player.name}
        ref={textRef}
        style={playerText}
      />
    </>
  )
}
