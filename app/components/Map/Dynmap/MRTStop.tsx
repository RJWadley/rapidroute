import { extend, useApp } from "@pixi/react"
import { Container, Point, Text } from "pixi.js"
import { useEffect, useRef, useState } from "react"
import { useViewport, useViewportMoved } from "../PixiViewport"
import { regular } from "../textStyles"
import MulticolorDot from "./MulticolorDot"
import { SCALE_FACTOR, shiftWorldCoordinate } from "../pixiUtils"
import { useSearchParamState } from "app/utils/useSearchParamState"

interface MRTStopProps {
	name: string
	colors: string[]
	x: number
	y: number
	z: number
}

extend({ Container, Text })

export default function MRTStop({ name, colors, x, y, z }: MRTStopProps) {
	const viewport = useViewport()
	const textRef = useRef<Text>(null)
	const containerRef = useRef<Container>(null)
	const [hover, setHover] = useState(false)

	const updateSize = () => {
		if (textRef.current && viewport) {
			textRef.current.scale = new Point(
				1 / viewport.scale.x,
				1 / viewport.scale.y,
			)
			textRef.current.alpha = 1
		}
	}

	const pointerIn = () => {
		setHover(true)
	}
	const pointerOut = () => {
		setHover(false)
	}

	const updateOpacityWhenClose = () => {
		if (viewport && containerRef.current) {
			updateSize()
			const zoom = viewport.scale.x

			const opacity = Math.max(0, Math.min(1, 1 - (zoom - 2.75)))
			containerRef.current.alpha = opacity
		}
	}
	useViewportMoved(updateOpacityWhenClose)

	// biome-ignore lint/correctness/useExhaustiveDependencies: allowable extra dep
	useEffect(updateSize, [hover])

	const app = useApp()
	if (!app) return

	const [isometric] = useSearchParamState("isometric")
	const skewed = isometric ? shiftWorldCoordinate(x, y, z) : { x, z }

	return (
		<container
			eventMode="static"
			onPointerEnter={pointerIn}
			onPointerLeave={pointerOut}
			onTouchEnd={() => setTimeout(pointerOut, 3000)}
			cursor="pointer"
			ref={containerRef}
			cullable
		>
			<MulticolorDot
				point={{ x: skewed.x, z: skewed.z }}
				colors={colors}
				renderer={app.renderer}
			/>
			{hover && (
				<container
					angle={isometric ? 45 : 0}
					scale={isometric ? { x: 1, y: 1 / SCALE_FACTOR } : { x: 1, y: 1 }}
					x={skewed.x}
					y={skewed.z}
				>
					<pixiText
						text={name}
						style={regular}
						ref={textRef}
						anchor={{
							x: 0.5,
							y: 1.5,
						}}
						alpha={0}
					/>
				</container>
			)}
		</container>
	)
}
