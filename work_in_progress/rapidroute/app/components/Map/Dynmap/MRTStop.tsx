import { Container, Point, Text } from "pixi.js"
import { useEffect, useRef, useState } from "react"
import { regular } from "../textStyles"
import { useViewport, useViewportMoved } from "../PixiViewport"
import MulticolorDot from "./MulticolorDot"
import { extend, useApp } from "@pixi/react"

interface MRTStopProps {
	name: string
	colors: string[]
	x: number
	z: number
	visible: boolean
}

extend({ Container, Text })

export default function MRTStop({ name, colors, x, z, visible }: MRTStopProps) {
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

	return (
		<container
			eventMode="static"
			onpointerenter={pointerIn}
			onmouseleave={pointerOut}
			ontouchend={() => setTimeout(pointerOut, 3000)}
			cursor="pointer"
			visible={visible}
			ref={containerRef}
			cullable
		>
			<MulticolorDot point={{ x, z }} colors={colors} renderer={app.renderer} />
			{hover && (
				<pixiText
					text={name}
					x={x}
					y={z}
					style={regular}
					ref={textRef}
					anchor={{
						x: 0.5,
						y: 1.5,
					}}
					alpha={0}
				/>
			)}
		</container>
	)
}
