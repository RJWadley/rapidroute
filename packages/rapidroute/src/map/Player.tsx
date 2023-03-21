import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { Container, Sprite, Text } from "@pixi/react"
import { gsap } from "gsap"
import {
  Point,
  Texture,
  Container as PixiContainer,
  Sprite as PixiSprite,
  Text as PixiText,
} from "pixi.js"

import { clearLocal, getLocal, setLocal } from "utils/localUtils"
import usePlayerHead from "utils/usePlayerHead"

import { useViewport, useViewportMoved } from "./PixiViewport"
import { regular, regularHover } from "./textStyles"
import { Player } from "./worldInfoType"
import { zoomToPlayer } from "./zoomCamera"

export default function MapPlayer({ player }: { player: Player }) {
  const playerHead = usePlayerHead(player.name)
  const viewport = useViewport()
  const headRef = useRef<PixiSprite>(null)
  const textRef = useRef<PixiText>(null)
  const containerRef = useRef<PixiContainer>(null)
  const [hover, setHover] = useState(false)

  /**
   * animate the player's head and name to the player's position
   */
  useLayoutEffect(() => {
    if (!viewport) return

    const tween = gsap.to(containerRef.current, {
      x: player.x,
      y: player.z,
      duration: 1.5,
      ease: "linear",
      alpha: 1,
    })

    return () => {
      tween.kill()
    }
  }, [player.x, player.z, viewport])

  /**
   * follow the player if they are being followed
   * and update their position for the navigator
   */
  useEffect(() => {
    if (player.name === getLocal("followingPlayer") && viewport) {
      zoomToPlayer(player.x, player.z, viewport)
    }
    if (
      player.account.toLowerCase() ===
      getLocal("selectedPlayer")?.toString().toLowerCase()
    ) {
      setLocal("lastKnownLocation", { x: player.x, z: player.z })
    }
  }, [player.account, player.name, player.x, player.z, viewport])

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
      textRef.current.anchor.y = 1.5 + newAdjustment ** 3
    }
  }
  useViewportMoved(updatePlayerHeadSize)

  const pointerIn = () => {
    setHover(true)
  }
  const pointerOut = () => {
    setHover(false)
  }
  const click = () => {
    setHover(false)
    setLocal("followingPlayer", player.name)
    clearLocal("lastMapInteraction")
    if (viewport) zoomToPlayer(player.x, player.z, viewport)
  }

  /**
   * apply initial state
   */
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current && containerRef.current) {
      isFirstRender.current = false
      containerRef.current.alpha = 0
      containerRef.current.x = player.x
      containerRef.current.y = player.z
    }
  }, [player.x, player.z])

  return (
    <Container
      eventMode="static"
      cursor="pointer"
      onpointerenter={pointerIn}
      onpointerout={pointerOut}
      onclick={click}
      ontouchstart={pointerIn}
      ontouchend={() => {
        pointerOut()
        click()
      }}
      ref={containerRef}
      cullable
    >
      {playerHead && (
        <Sprite texture={Texture.from(playerHead)} anchor={0.5} ref={headRef} />
      )}
      <Text
        anchor={[0.5, 1.5]}
        text={player.name}
        style={hover ? regularHover : regular}
        ref={textRef}
      />
    </Container>
  )
}
