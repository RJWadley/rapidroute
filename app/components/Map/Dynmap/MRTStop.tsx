import { extend, useApplication } from "@pixi/react"
import { useViewport, useViewportMoved } from "app/components/Map/Viewport"
import { useLocalIsometric } from "app/utils/locals"
import type { Viewport } from "pixi-viewport"
import { Container, Point, Text, TextStyle } from "pixi.js"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { shiftWorldCoordinateToIsometric, unskew } from "../util/isometric"
import MulticolorDot from "./MulticolorDot"

extend({ Container, Text })

export default function MRTStop({
	name,
	codes,
	colors,
	x,
	y,
	z,
}: {
	name: string | null
	codes: string[]
	colors: string[]
	x: number
	y: number
	z: number
}) {
	const { app } = useApplication()
	const viewport = useViewport()
	const [isometric] = useLocalIsometric()
	const [isHover, setIsHover] = useState(false)
	const containerRef = useRef<Container>(null)
	const codesTextRef = useRef<Text>(null)
	const labelTextRef = useRef<Text>(null)
	const touchTargetRef = useRef<Text>(null)

	/**
uh	 */
	const updateSize = useCallback((viewport: Viewport) => {
		const scale = { x: 1 / viewport.scale.x, y: 1 / viewport.scale.y }
		if (codesTextRef.current) codesTextRef.current.scale = scale
		if (labelTextRef.current) labelTextRef.current.scale = scale
		if (touchTargetRef.current) {
			touchTargetRef.current.height = 75 / viewport.scale.y
			touchTargetRef.current.width = 75 / viewport.scale.x
		}
	}, [])

	useViewportMoved((viewport) => {
		if (isHover) updateSize(viewport)
	})

	/**
	 * when we first hover, update the size to be correct
	 * since we only update this when we're hovering
	 */
	useLayoutEffect(() => {
		if (viewport && isHover) updateSize(viewport)
	}, [viewport, isHover, updateSize])

	const enter = () => setIsHover(true)
	const leave = () => setIsHover(false)
	const skewed = isometric
		? shiftWorldCoordinateToIsometric({ x, y, z })
		: { x, z }

	if (!app) return null
	return (
		<>
			<pixiContainer
				ref={containerRef}
				cursor="pointer"
				eventMode="static"
				onPointerEnter={enter}
				onMouseLeave={leave}
				onTouchEnd={() => setTimeout(leave, 3000)}
				cullable
				x={skewed.x}
				y={skewed.z}
			>
				<MulticolorDot colors={colors} renderer={app.renderer} />

				{isHover && (
					<>
						<pixiText
							ref={codesTextRef}
							text={codes.join(" - ")}
							style={codeStyle}
							anchor={{
								x: 1,
								y: 0.5,
							}}
							x={-30}
							{...unskew(isometric)}
						/>
						{name && (
							<pixiText
								ref={labelTextRef}
								text={name}
								style={labelStyle}
								x={30}
								anchor={{
									x: 0,
									y: 0.5,
								}}
								{...unskew(isometric)}
							/>
						)}
					</>
				)}
			</pixiContainer>
			<pixiText
				ref={touchTargetRef}
				cursor="pointer"
				eventMode="static"
				text=" "
				x={skewed.x}
				y={skewed.z}
				anchor={{ x: 0.5, y: 0.5 }}
				onPointerEnter={enter}
				onMouseLeave={leave}
				onTouchEnd={() => setTimeout(leave, 3000)}
			/>
		</>
	)
}

export const codeStyle = new TextStyle({
	fill: "white",
	stroke: {
		width: 4,
		color: "black",
		miterLimit: 4,
		cap: "round",
	},
	fontFamily: "Inter, Arial",
	fontSize: 24,
	fontWeight: "700",
	align: "center",
})

export const labelStyle = new TextStyle({
	fill: "white",
	stroke: {
		width: 3,
		color: "black",
		miterLimit: 4,
		cap: "round",
	},
	fontFamily: "Inter, Arial",
	fontSize: 20,
	fontWeight: "300",
	align: "center",
})
