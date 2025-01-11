import { useDeepCompareMemo } from "use-deep-compare"
import { getDistance } from "../../../utils/getDistance"
import MRTStop from "./MRTStop"
import type { MRTStopData } from "../markers-schema"

export interface ColoredMarker {
	marker: MRTStopData
	color: string
	invertedColor: string
}

type ConstructedStop = {
	codes: string[]
	labels: (string | null)[]
	x: number
	y: number
	z: number
	markers: MRTStopData[]
	singleColors: string[]
	combinedColors?: string[]
}

/**
 * extract the name of a stop from it's markers
 */
const foobar = /^(\w\w?[\d]+) Station$/i
const namedParens = /^(.*) \((\w\w?[\dXHWM]+)\)$/
const codeFirst = /^(\w\w?[\d]+) (.*)$/i
const getStopName = (marker: MRTStopData) => {
	if (foobar.test(marker.label)) {
		const code = marker.label.match(foobar)?.[1]?.trim()
		if (code) return { label: null, code }
		throw new Error(
			`could not extract data with strategy 'foobar' from stop: '${marker.label}'`,
		)
	}

	if (namedParens.test(marker.label)) {
		const label = marker.label.match(namedParens)?.[1]?.trim()
		const code = marker.label.match(namedParens)?.[2]?.trim()
		if (label && code) return { label, code }
		throw new Error(
			`could not extract data with strategy 'namedParens' from stop: '${marker.label}'`,
		)
	}

	if (codeFirst.test(marker.label)) {
		const code = marker.label.match(codeFirst)?.[1]?.trim()
		const label = marker.label.match(codeFirst)?.[2]?.trim()
		if (label && code) return { label, code }
		throw new Error(
			`could not extract data with strategy 'codeFirst' from stop: '${marker.label}'`,
		)
	}

	throw new Error(`stop matched no regex: '${marker.label}'`)
}

export default function MRTStops({
	stops: coloredMarkers,
}: {
	stops: ColoredMarker[]
}) {
	/**
	 * iterate over our stops and combine any that are close together
	 */
	const stops = useDeepCompareMemo(() => {
		const newStops: ConstructedStop[] = []

		for (const newStop of coloredMarkers) {
			const stopMeta = getStopName(newStop.marker)

			// if the stop is within a distance of an existing stop, add it to that stop
			const maxDistance = 20
			const existingStop = newStops.find((stop) => {
				return (
					getDistance(stop.x, stop.z, newStop.marker.x, newStop.marker.z) <
					maxDistance
				)
			})
			if (existingStop) {
				// update meta
				existingStop.codes.push(stopMeta.code)
				existingStop.labels.push(stopMeta.label)

				// merge the positions
				existingStop.markers.push(newStop.marker)
				existingStop.x =
					existingStop.markers.reduce((sum, marker) => sum + marker.x, 0) /
					existingStop.markers.length
				existingStop.z =
					existingStop.markers.reduce((sum, marker) => sum + marker.z, 0) /
					existingStop.markers.length
				existingStop.combinedColors ||= [
					existingStop.singleColors[0] ?? "black",
				]
				existingStop.combinedColors.push(newStop.color)
			} else {
				newStops.push({
					codes: [stopMeta.code],
					labels: [stopMeta.label],
					x: newStop.marker.x,
					y: newStop.marker.y,
					z: newStop.marker.z,
					markers: [newStop.marker],
					singleColors: [newStop.color, newStop.invertedColor],
				})
			}
		}

		return newStops
	}, [coloredMarkers])

	return stops.map((stop) => {
		const { combinedColors, singleColors, markers, x, y, z } = stop

		return (
			<MRTStop
				key={`${x}${z}`}
				colors={combinedColors ?? singleColors}
				x={x}
				y={y}
				z={z}
				name={stop.labels
					.filter(Boolean)
					// remove the word 'Station'
					.map((label) => label.replace(/ Station$/, ""))

					// filter out duplicates
					.filter((label, i, arr) => arr.indexOf(label) === i)
					.join(", ")}
				codes={stop.codes}
			/>
		)
	})
}
