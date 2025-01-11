import Line from "./Line"
import type { MRTLineData } from "../markers-schema"

function LineSegment({
	line,
	background = false,
}: {
	line: MRTLineData
	background: boolean
}) {
	const points = line.x
		.map((x, i) => {
			const z = line.z[i] ?? 0
			const y = line.y[i] ?? 0
			return { x, y, z }
		})
		.filter(Boolean)

	return (
		<Line
			points={points}
			color={background ? "#000000" : line.color}
			width={background ? 15 : 10}
		/>
	)
}

export default function MarkerLine({
	line,
}: {
	line: MRTLineData[]
}) {
	return (
		<>
			{line.map((segment) => (
				<LineSegment line={segment} background key={segment.key} />
			))}
			{line.map((segment) => (
				<LineSegment line={segment} background={false} key={segment.key} />
			))}
		</>
	)
}
