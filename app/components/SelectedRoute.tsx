"use client"

import type { Place } from "app/data"
import type { Coordinate } from "app/data/coordinates"
import { ArrowForward } from "app/icons/arrowForward"
import { Boat } from "app/icons/boat"
import { Bus } from "app/icons/bus"
import { Flight } from "app/icons/flight"
import { FlightLand } from "app/icons/flightLand"
import { FlightTakeoff } from "app/icons/flightTakeoff"
import { Navigation } from "app/icons/navigation"
import { Share } from "app/icons/share"
import { Train } from "app/icons/train"
import { Walk } from "app/icons/walk"
import { Warp } from "app/icons/warp"
import { formatTime } from "app/utils/formatTime"
import { capsizeInter } from "app/utils/text"
import { theme } from "app/utils/theme"
import { useLogos } from "app/utils/useLogos"
import { readableColor } from "color2k"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useState } from "react"
import { styled } from "restyle"
import { type RouteResult, useRouting } from "../providers/RoutingContext"
import Box from "./Box"
import { LogoFull, LogoIcon, hasIcon } from "./CompanyLogo"
import { determineDifferences, getRouteTitle } from "./RouteOptions"

type Leg = RouteResult["path"][number]
type Option = Leg["options"][number]
type OptionOfType<T extends Option["type"]> = Extract<Option, { type: T }>
type LineOption = OptionOfType<"RailLine" | "SeaLine" | "BusLine">

/**
 * short code to show at the end of a step, if the place has one
 */
const getCode = (place: Place | Coordinate) => {
	if (place.type === "AirAirport") return place.code
	if ("codes" in place) return place.codes?.[0]
	return undefined
}

const getName = (place: Place | Coordinate) => {
	if (place.type === "Coordinate")
		return `${place.coordinates[0]}, ${place.coordinates[1]}`
	return place.name || getCode(place) || "Unnamed Location"
}

/**
 * direction labels live on the connection between the first two stops of a leg
 */
const getDirectionLabel = (leg: Leg, line: LineOption) => {
	const next = leg.skipped?.[0] ?? leg.to
	if (!("connections" in leg.from)) return undefined

	const direction = leg.from.connections[next.i]?.find(
		(connection) => connection.line === line.i,
	)?.direction
	if (!direction) return undefined

	if (direction.direction === next.i) return direction.forward_label
	if (direction.direction === leg.from.i) return direction.backward_label
	return undefined
}

const capitalize = (text: string) =>
	text.charAt(0).toUpperCase() + text.slice(1)

/**
 * split a leg into groups of options that share a type, so that
 * (for example) three flights between the same airports render together
 */
const groupOptions = (leg: Leg) => {
	const groups = Object.groupBy(leg.options, (option) => option.type)
	return Object.values(groups).filter((group) => group !== undefined)
}

export default function SelectedRoute() {
	const { routes, preferredRoute } = useRouting()

	const index = preferredRoute ?? 0
	const result = routes?.[index]
	const title = routes
		? getRouteTitle(determineDifferences(routes), index)
		: undefined

	return (
		<Box isVisible={!!result}>
			<AnimatePresence mode="popLayout" initial={false}>
				{result && (
					<Content
						key={result.id}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<Header>
							<Title>{title}</Title>
							<TimeChip>{formatTime(result.time)}</TimeChip>
						</Header>
						<Actions>
							<ActionButton
								type="button"
								prominent
								disabled
								title="Coming soon"
							>
								<Navigation width={18} height={18} />
								Start Navigation
							</ActionButton>
							<ShareButton />
						</Actions>
						<Steps>
							{result.path.flatMap((leg) =>
								groupOptions(leg).map((group) => (
									<Step
										key={`${leg.id}-${group[0]?.type}`}
										leg={leg}
										options={group}
									/>
								)),
							)}
						</Steps>
					</Content>
				)}
			</AnimatePresence>
		</Box>
	)
}

function ShareButton() {
	const [copied, setCopied] = useState(false)

	const share = async () => {
		const url = window.location.href
		if (navigator.share) {
			await navigator.share({ url }).catch(() => {})
			return
		}
		await navigator.clipboard.writeText(url)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<ActionButton type="button" onClick={share}>
			<Share width={18} height={18} />
			{copied ? "Link Copied" : "Share"}
		</ActionButton>
	)
}

function Step({ leg, options }: { leg: Leg; options: Option[] }) {
	const [first] = options
	if (!first) return null

	switch (first.type) {
		case "Walk":
			return <WalkStep leg={leg} option={first} />
		case "SpawnWarp":
			return <WarpStep leg={leg} option={first} />
		case "AirFlight":
			return (
				<FlightStep
					leg={leg}
					flights={options as OptionOfType<"AirFlight">[]}
				/>
			)
		case "RailLine":
		case "SeaLine":
		case "BusLine":
			return <LineStep leg={leg} lines={options as LineOption[]} />
		default:
			first satisfies never
			return null
	}
}

/**
 * one row of a step - a marker column on the left (icon, dots, and the connecting line)
 * and the step content on the right
 */
function Row({
	marker,
	lineAbove = false,
	lineBelow = false,
	dashed = false,
	alignMarker = "start",
	children,
}: {
	marker?: React.ReactNode
	lineAbove?: boolean
	lineBelow?: boolean
	dashed?: boolean
	alignMarker?: "start" | "end"
	children?: React.ReactNode
}) {
	return (
		<>
			<MarkerColumn>
				<Segment
					visible={lineAbove}
					dashed={dashed}
					grow={alignMarker === "end"}
				/>
				{marker}
				<Segment
					visible={lineBelow}
					dashed={dashed}
					grow={alignMarker === "start"}
				/>
			</MarkerColumn>
			<RowContent>{children}</RowContent>
		</>
	)
}

function WalkStep({ leg, option }: { leg: Leg; option: OptionOfType<"Walk"> }) {
	return (
		<StepGrid>
			<Row marker={<Walk />}>
				<Body>{Math.round(option.distance).toLocaleString()} blocks</Body>
			</Row>
			<Row marker={<EndMarker place={leg.to} />}>
				<Body>{getName(leg.to)}</Body>
			</Row>
		</StepGrid>
	)
}

function WarpStep({
	leg,
	option,
}: { leg: Leg; option: OptionOfType<"SpawnWarp"> }) {
	return (
		<StepGrid>
			<Row marker={<Warp />}>
				<Body>
					Warp to <strong>{option.name}</strong>
				</Body>
			</Row>
			<Row marker={<EndMarker place={leg.to} />}>
				<Body>{getName(leg.to)}</Body>
			</Row>
		</StepGrid>
	)
}

function FlightStep({
	leg,
	flights,
}: { leg: Leg; flights: OptionOfType<"AirFlight">[] }) {
	const stops = leg.skipped ?? []
	const logos = useLogos()

	return (
		<StepGrid>
			<Row marker={<Flight />} lineBelow>
				<AirportPair>
					<Airport>
						<AirportCode>{getCode(leg.from)}</AirportCode>
						<Small>{getName(leg.from)}</Small>
					</Airport>
					<ArrowForward width={28} height={28} />
					<Airport end>
						<AirportCode bold>{getCode(leg.to)}</AirportCode>
						<Small>{getName(leg.to)}</Small>
					</Airport>
				</AirportPair>
				{stops.length > 0 && (
					<Small>Stops at {stops.map(getName).join(", ")}</Small>
				)}
			</Row>
			{flights.map((flight, index) => {
				const isLast = index === flights.length - 1
				const fromGate = flight.gates?.find((g) => g.airport === leg.from.i)
				const toGate = flight.gates?.find((g) => g.airport === leg.to.i)

				return (
					<Row
						key={flight.i}
						lineAbove
						lineBelow={!isLast}
						alignMarker="end"
						marker={isLast ? <EndMarker place={leg.to} /> : undefined}
					>
						<FlightCard>
							<div>
								<CardTitle>
									{flight.airline ? (
										<CompanyLink company={flight.airline} />
									) : (
										"Unknown Airline"
									)}
								</CardTitle>
								<Body>Flight {flight.codes.join(", ")}</Body>
								{(fromGate?.code || toGate?.code) && (
									<Gates>
										{fromGate?.code && (
											<Gate>
												<FlightTakeoff width={16} height={16} />
												Gate {fromGate.code}
											</Gate>
										)}
										{toGate?.code && (
											<Gate>
												<FlightLand width={16} height={16} />
												Gate {toGate.code}
											</Gate>
										)}
									</Gates>
								)}
							</div>
							{flight.airline &&
								(hasIcon(logos?.[flight.airline.i]) ? (
									<LogoIcon
										logo={logos?.[flight.airline.i]}
										name={flight.airline.name}
									/>
								) : (
									<LogoFull
										logo={logos?.[flight.airline.i]}
										name={flight.airline.name}
										maxWidth={96}
										height={40}
									/>
								))}
						</FlightCard>
					</Row>
				)
			})}
		</StepGrid>
	)
}

const lineIcons = {
	RailLine: Train,
	SeaLine: Boat,
	BusLine: Bus,
}

/**
 * if a leg skips a lot of stops, only show a few of them
 */
const summarizeStops = (stops: (Place | Coordinate)[]) => {
	if (stops.length <= 4) return stops.map((place) => ({ place }))

	const first = stops.slice(0, 1)
	const last = stops.slice(-2)
	return [
		...first.map((place) => ({ place })),
		{ hidden: stops.length - 3 },
		...last.map((place) => ({ place })),
	]
}

function LineStep({ leg, lines }: { leg: Leg; lines: LineOption[] }) {
	const logos = useLogos()
	const [first] = lines
	if (!first) return null

	const Icon = lineIcons[first.type]
	const stopCount = (leg.skipped?.length ?? 0) + 1
	const direction = lines
		.map((line) => getDirectionLabel(leg, line))
		.find((label) => label !== undefined)
	const stops = summarizeStops(leg.skipped ?? [])

	return (
		<StepGrid pill>
			<Row marker={<Icon />}>
				<LineCards>
					{lines.map((line) => (
						<LineCard key={line.i}>
							<div>
								{line.company && (
									<Body>
										<CompanyLink company={line.company} />
									</Body>
								)}
								<CardTitle>{line.name || line.code}</CardTitle>
							</div>
							{hasIcon(logos?.[line.i]) ? (
								<LogoIcon
									logo={logos?.[line.i]}
									name={line.name || line.code}
								/>
							) : logos?.[line.i] ? (
								<LogoFull
									logo={logos[line.i]}
									name={line.name || line.code}
									maxWidth={120}
								/>
							) : (
								<LineBadge color={line.color} code={line.code} />
							)}
						</LineCard>
					))}
				</LineCards>
			</Row>
			<Row marker={<Dot />} lineBelow>
				<Station>{getName(leg.from)}</Station>
				<Body>
					{direction ? `${capitalize(direction)} · ` : ""}
					{stopCount === 1 ? "1 stop" : `${stopCount} stops`}
				</Body>
			</Row>
			{stops.map((stop) =>
				"hidden" in stop ? (
					<Row key="hidden" lineAbove lineBelow dashed>
						<Small>{stop.hidden} more stops</Small>
					</Row>
				) : (
					<Row key={stop.place.i} marker={<Dot small />} lineAbove lineBelow>
						<Small>{getName(stop.place)}</Small>
					</Row>
				),
			)}
			<Row marker={<EndMarker place={leg.to} />} lineAbove alignMarker="end">
				<Station bold>{getName(leg.to)}</Station>
			</Row>
		</StepGrid>
	)
}

function LineBadge({ color, code }: { color?: string; code: string }) {
	const background = color ?? "#888888"
	const text = (() => {
		try {
			return readableColor(background)
		} catch {
			return undefined
		}
	})()

	return (
		<Badge style={{ background, color: text }}>
			{code.length <= 4 ? code : code.slice(0, 3)}
		</Badge>
	)
}

/**
 * companies link to their entry in the registry
 */
function CompanyLink({ company }: { company: { i: string; name: string } }) {
	return (
		<CompanyAnchor href={`/companies#${company.i}`}>
			{company.name}
		</CompanyAnchor>
	)
}

function EndMarker({ place }: { place: Place | Coordinate }) {
	const code = getCode(place)
	// some stops use their full name as a code, which won't fit in the tag
	return code && code.length <= 4 ? <Tag>{code}</Tag> : <Dot />
}

const Content = styled(motion.div, {
	padding: 20,
	display: "grid",
	gap: 12,
})

const Header = styled("div", {
	display: "grid",
	gridTemplateColumns: "1fr auto",
	alignItems: "start",
	gap: 8,
})

const Title = styled("div", {
	fontSize: 24,
	fontWeight: "bold",
	wordBreak: "break-word",
})

const TimeChip = styled("div", {
	background: theme.timeBadge,
	color: theme.timeBadgeText,
	fontSize: 16,
	fontWeight: "bold",
	padding: "4px 12px",
	borderRadius: 8,
})

const Actions = styled("div", {
	display: "flex",
	gap: 8,
})

const ActionButton = styled(
	"button",
	({ prominent }: { prominent?: boolean }) => ({
		display: "flex",
		alignItems: "center",
		gap: 8,
		padding: "6px 12px",
		borderRadius: 8,
		font: "inherit",
		fontSize: 14,
		color: prominent ? theme.controlHeadingText : theme.cardText,
		background: prominent ? theme.controlHeadingBackground : "transparent",
		border: prominent
			? "1px solid transparent"
			: `1px solid ${theme.cardActive}`,
		cursor: "pointer",
		transition: "background 0.2s, opacity 0.2s",

		"&:hover": {
			background: prominent ? theme.controlHeadingBackground : theme.cardHover,
		},

		"&:disabled": {
			cursor: "not-allowed",
			opacity: 0.6,
		},
	}),
)

const Steps = styled("div", {
	display: "grid",
	gap: 24,
	marginTop: 8,
})

const StepGrid = styled("div", ({ pill }: { pill?: boolean }) => ({
	display: "grid",
	gridTemplateColumns: "40px 1fr",
	columnGap: 12,
	position: "relative",
	padding: pill ? "8px 0" : undefined,
	margin: pill ? "-4px 0" : undefined,

	/* the pill shape behind the marker column of line steps */
	"&::before": pill
		? {
				content: '""',
				position: "absolute",
				inset: "0 auto 0 0",
				width: 40,
				borderRadius: 20,
				background: theme.lineCard,
			}
		: undefined,
}))

const MarkerColumn = styled("div", {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	position: "relative",
	color: theme.timeline,
})

const Segment = styled(
	"div",
	({
		visible,
		dashed,
		grow,
	}: { visible: boolean; dashed: boolean; grow: boolean }) => ({
		width: 0,
		minHeight: 6,
		flex: grow ? "1 0 6px" : "0 0 6px",
		borderLeft: visible
			? `2px ${dashed ? "dotted" : "solid"} ${theme.timeline}`
			: "2px solid transparent",
	}),
)

const RowContent = styled("div", {
	padding: "4px 0",
	display: "grid",
	gap: 4,
	alignContent: "start",
	minWidth: 0,
})

const Dot = styled("div", ({ small }: { small?: boolean }) => ({
	width: small ? 6 : 8,
	height: small ? 6 : 8,
	borderRadius: "50%",
	background: theme.timeline,
	flexShrink: 0,
	margin: "4px 0",
}))

const Tag = styled("div", {
	border: `1px solid ${theme.timeline}`,
	borderRadius: 4,
	padding: "1px 4px",
	fontSize: 11,
	fontWeight: 500,
	textTransform: "uppercase",
	whiteSpace: "nowrap",
	flexShrink: 0,
})

const Body = styled("div", {
	fontSize: 16,
})

const Small = styled("div", {
	fontSize: 12,
	color: theme.cardTextMuted,
})

const CardTitle = styled("div", {
	fontSize: 18,
	fontWeight: "bold",
	wordBreak: "break-word",
})

const Station = styled("div", ({ bold }: { bold?: boolean }) => ({
	...capsizeInter,
	fontSize: 24,
	fontWeight: bold ? "bold" : undefined,
	margin: "6px 0",
	wordBreak: "break-word",
}))

const LineCards = styled("div", {
	display: "grid",
	gap: 8,
})

const LineCard = styled("div", {
	display: "grid",
	gridTemplateColumns: "1fr auto",
	alignItems: "center",
	gap: 8,
	padding: "8px 12px",
	borderRadius: 12,
	background: theme.lineCard,
})

const Badge = styled("div", {
	width: 44,
	height: 44,
	borderRadius: 8,
	display: "grid",
	placeItems: "center",
	fontSize: 14,
	fontWeight: "bold",
})

const FlightCard = styled("div", {
	padding: "10px 14px",
	borderRadius: 12,
	background: theme.flightCard,
	color: theme.flightCardText,
	display: "grid",
	gridTemplateColumns: "1fr auto",
	alignItems: "center",
	gap: 8,
})

const CompanyAnchor = styled(Link, {
	color: "inherit",
	textDecoration: "none",

	"&:hover": {
		textDecoration: "underline",
	},
})

const Gates = styled("div", {
	display: "flex",
	gap: 16,
	fontSize: 14,
	marginTop: 4,
})

const Gate = styled("div", {
	display: "flex",
	alignItems: "center",
	gap: 4,
})

const AirportPair = styled("div", {
	display: "grid",
	gridTemplateColumns: "1fr auto 1fr",
	alignItems: "start",
	gap: 8,
})

const Airport = styled("div", ({ end }: { end?: boolean }) => ({
	display: "grid",
	gap: 4,
	textAlign: end ? "right" : "left",
}))

const AirportCode = styled("div", ({ bold }: { bold?: boolean }) => ({
	...capsizeInter,
	fontSize: 32,
	fontWeight: bold ? "bold" : 300,
	margin: "8px 0",
}))
