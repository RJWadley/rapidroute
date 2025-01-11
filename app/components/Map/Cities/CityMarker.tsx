import { useLocalIsometric } from "app/utils/locals"
import { type Container, Point, TextStyle } from "pixi.js"
import { useRef } from "react"
import { useViewport, useViewportMoved } from "../Viewport"
import { convertPointToIsometric } from "../util/isometric"
import { useHideOverlapping } from "../util/useHideOverlapping"
import { MotionContainer } from "../MotionContainer"

type CityType =
	| "Unranked"
	| "Community"
	| "Councillor"
	| "Mayor"
	| "Senator"
	| "Governor"
	| "Premier"
	| "spawn"

const min = 0.015
const max = 0.25
const ZoomThresholds: Partial<Record<CityType, number>> = {
	spawn: min,
	Premier: min,
	Governor: 0.035,
	Community: 0.05,
	Senator: 0.1,
	Mayor: 0.15,
	Councillor: 0.2,
}

export default function CityMarker({
	name,
	id,
	x,
	z,
	type,
}: {
	name: string
	id: string
	x: number
	z: number
	type: CityType
}) {
	const viewport = useViewport()
	const containerRef = useRef<Container>(null)

	const onMove = () => {
		if (containerRef.current && viewport) {
			containerRef.current.scale = new Point(
				1 / viewport.scale.x,
				1 / viewport.scale.y,
			)
		}
	}
	useViewportMoved(onMove)

	const visible = useHideOverlapping({
		item: containerRef,
		priority: type,
		minZoom: ZoomThresholds[type] ?? max,
		debugName: name,
	})

	const [isometric] = useLocalIsometric()
	const skewed = isometric ? convertPointToIsometric({ x, z }) : { x, z }

	return (
		<MotionContainer
			x={skewed.x}
			y={skewed.z}
			ref={containerRef}
			cursor="pointer"
			cullable
			animate={{ alpha: visible ? 1 : 0 }}
		>
			<pixiText text={name} style={regular} anchor={0.5} />
		</MotionContainer>
	)
}

const regular = new TextStyle({
	fill: "white",
	stroke: {
		width: 3,
		color: "black",
		miterLimit: 4,
		cap: "round",
	},
	fontFamily: "Inter, Arial",
	fontSize: 16,
	fontWeight: "500",
	align: "center",
})
