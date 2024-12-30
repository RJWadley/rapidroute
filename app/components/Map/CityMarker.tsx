import { Point, type Container, type Text } from "pixi.js"
import { useRef } from "react"
import { showItem, hideItem, skewWorldCoordinate } from "./pixiUtils"
import { useViewport, useViewportMoved } from "./PixiViewport"
import { regular, regularHover } from "./textStyles"
import useHideOverlapping from "./useHideOverlapping"
import { useSearchParamState } from "app/utils/useSearchParamState"

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
	const hoverTextRef = useRef<Text>(null)

	const onMove = () => {
		if (containerRef.current && viewport) {
			containerRef.current.scale = new Point(
				1 / viewport.scale.x,
				1 / viewport.scale.y,
			)
		}
	}
	useViewportMoved(onMove)

	const pointerIn = () => {
		if (hoverTextRef.current) showItem(hoverTextRef.current, "auto")
	}
	const pointerOut = () => {
		if (hoverTextRef.current) hideItem(hoverTextRef.current)
	}

	useHideOverlapping({
		item: containerRef,
		name,
		priority: type,
		minZoom: ZoomThresholds[type] ?? max,
	})

	const [isometric] = useSearchParamState("isometric")
	const skewed = isometric ? skewWorldCoordinate(x, 60, z) : { x, z }

	return (
		<container
			x={skewed.x}
			y={skewed.z}
			ref={containerRef}
			cursor="pointer"
			onPointerEnter={pointerIn}
			onPointerLeave={pointerOut}
			cullable
		>
			<pixiText text={name} style={regular} anchor={0.5} />
			<pixiText
				text={name}
				style={regularHover}
				anchor={0.5}
				ref={hoverTextRef}
				visible={false}
			/>
		</container>
	)
}
