import { useSuspenseQuery } from "@tanstack/react-query"
import type { Player as PlayerType } from "app/api/players/type"
import type { Coordinate } from "app/data/coordinates"
import { getClosestPlaces } from "app/pathing/getClosestPlaces"
import { cityRankColors } from "app/utils/cityRankColors"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { getDistinctCodes } from "app/utils/displayNames"
import { useImageColor } from "app/utils/getImageColor"
import { dynamicColor, theme } from "app/utils/theme"
import { getLuminance } from "color2k"
import Image from "next/image"
import { type ReactNode, useState } from "react"
import { styled } from "restyle"
import { useTRPC } from "trpc/client"
import SearchResultIcon, { resultTypes } from "./SearchResultIcon"
import type useSearchBox from "./useSearchBox"

type SortedPlace = NonNullable<
	ReturnType<typeof useSearchBox>["searchResults"]
>[number]

const worldLabel = (world: CompressedPlace["world"] | "Unknown") =>
	world === "Space" ? "Space" : `${world} World`

function getResultTitle(place: SortedPlace) {
	if (place.type === "Player")
		return place.isOnline
			? `${place.username} · Online · ${worldLabel(place.world)} · X ${Math.round(place.x)}, Z ${Math.round(place.z)}`
			: `${place.username} · Offline`

	return [
		place.type === "Coordinate"
			? `${place.coordinates[0]}, ${place.coordinates[1]}`
			: place.name,
		resultTypes[place.type].label,
		place.type !== "Coordinate" && getDistinctCodes(place).join(", "),
		place.type !== "Coordinate" && place.company?.name,
		place.type === "Town" && place.rank,
		place.type === "Town" && place.mayor && `Mayor: ${place.mayor}`,
		place.type === "Town" &&
			place.deputy_mayor &&
			`Deputy: ${place.deputy_mayor}`,
		place.world && worldLabel(place.world),
		place.coordinates &&
			`X ${Math.round(place.coordinates[0])}, Z ${Math.round(place.coordinates[1])}`,
	]
		.filter(Boolean)
		.join(" · ")
}

function Place({ place }: { place: CompressedPlace | Coordinate }) {
	const isCoordinate = place.type === "Coordinate"
	const codes = isCoordinate ? [] : getDistinctCodes(place)
	const nameIsCode =
		!isCoordinate &&
		place.nameIsCode &&
		(place.type === "RailStation" || place.type === "AirAirport")
	const modes = isCoordinate
		? undefined
		: place.modes
				?.filter((mode) => mode !== "warpPlane")
				.map((mode) => (mode === "helicopter" ? "Helicopter" : "Seaplane"))
				.join(" / ")
	const rank =
		place.type === "Town" && place.rank !== "Unranked" ? place.rank : undefined
	const description = [
		!isCoordinate && place.company?.name,
		resultTypes[place.type].label,
		rank,
		modes,
		place.world &&
			(isCoordinate || place.world !== "New") &&
			worldLabel(place.world),
	]
		.filter(Boolean)
		.join(" · ")

	return (
		<>
			<Bullet
				accent={rank ? cityRankColors[rank] : resultTypes[place.type].color}
			>
				<SearchResultIcon type={place.type} />
			</Bullet>
			{nameIsCode ? (
				<NameCodes>
					{place.codes?.map((code) => (
						<NameCode key={code} accent={place.codeColors?.[code]}>
							{code}
						</NameCode>
					))}
				</NameCodes>
			) : (
				<ResultName>
					{isCoordinate
						? `${place.coordinates[0]}, ${place.coordinates[1]}`
						: place.name}
				</ResultName>
			)}
			<ResultDetails>{description}</ResultDetails>
			{codes.length > 0 && !isCoordinate ? (
				<Identifier>
					{codes.map((code) => (
						<Code key={code} accent={place.codeColors?.[code]}>
							{code}
						</Code>
					))}
				</Identifier>
			) : null}
		</>
	)
}

function Player({ player }: { player: SortedPlace & PlayerType }) {
	const trpc = useTRPC()
	const { data: compressedPlaces } = useSuspenseQuery(
		trpc.compressedPlaces.queryOptions(),
	)
	const avatarUrl = `https://mc-heads.net/avatar/${player.username}.png`
	const { data: color, isPending } = useImageColor(avatarUrl)
	const [avatarFailed, setAvatarFailed] = useState(false)
	if (isPending && !avatarFailed)
		return (
			<ResultRow place={player} loading>
				<PlayerSkeleton
					aria-hidden="true"
					style={{
						gridColumn: 1,
						gridRow: "1 / 3",
						width: 36,
						height: 36,
						borderRadius: 10,
					}}
				/>
				<PlayerSkeleton
					aria-hidden="true"
					style={{
						gridColumn: 2,
						gridRow: 1,
						width: 120,
						height: 12,
						borderRadius: 6,
					}}
				/>
				<PlayerSkeleton
					aria-hidden="true"
					style={{
						gridColumn: 2,
						gridRow: 2,
						width: 72,
						height: 10,
						borderRadius: 5,
					}}
				/>
			</ResultRow>
		)
	const [closestPlace] = player.isOnline
		? getClosestPlaces(
				[player.x, player.z],
				compressedPlaces.filter(
					(place) =>
						(place.type === "Town" || place.type === "AirAirport") &&
						place.world === player.world,
				),
			)
		: [null]
	const location = !player.isOnline
		? null
		: closestPlace && closestPlace.distance < 2000
			? `Near ${closestPlace.place.name}`
			: `X ${Math.round(player.x)}, Z ${Math.round(player.z)}`
	const description = [
		player.isOnline ? location : "Player",
		player.isOnline && player.world !== "New" && worldLabel(player.world),
	]
		.filter(Boolean)
		.join(" · ")

	return (
		<ResultRow place={player} baseColor={avatarFailed ? undefined : color}>
			<PlayerIcon online={player.isOnline}>
				{avatarFailed ? (
					<Bullet>
						<SearchResultIcon type="Player" />
					</Bullet>
				) : (
					<PlayerHead
						src={avatarUrl}
						alt=""
						width={36}
						height={36}
						unoptimized
						onError={() => setAvatarFailed(true)}
					/>
				)}
			</PlayerIcon>
			<PlayerName>{player.username}</PlayerName>
			<PlayerDetails>{description}</PlayerDetails>
		</ResultRow>
	)
}

function ResultRow({
	place,
	children,
	baseColor,
	loading = false,
}: {
	place: SortedPlace
	children: ReactNode
	baseColor?: string
	loading?: boolean
}) {
	return (
		<Wrapper
			type="button"
			title={getResultTitle(place)}
			onClick={place.selectItem}
			highlighted={place.highlighted}
			baseColor={baseColor}
			aria-busy={loading || undefined}
			ref={
				place.highlighted
					? (el) => {
							const bounds = el?.getBoundingClientRect()
							if (!bounds) return

							const isInView =
								bounds.top >= 0 &&
								bounds.bottom <=
									(window.innerHeight || document.documentElement.clientHeight)
							if (isInView) return

							el?.scrollIntoView({
								behavior: "smooth",
								block: "nearest",
							})
						}
					: null
			}
		>
			{children}
		</Wrapper>
	)
}

export default function SearchResult({ place }: { place: SortedPlace }) {
	return place.type === "Player" ? (
		<Player player={place} />
	) : (
		<ResultRow place={place}>
			<Place place={place} />
		</ResultRow>
	)
}

const hoverBackground = `linear-gradient(${theme.cardHover}, ${theme.cardHover})`
const activeBackground = `linear-gradient(${theme.cardActive}, ${theme.cardActive})`

const Wrapper = styled(
	"button",
	({
		highlighted,
		baseColor,
	}: {
		highlighted: boolean
		baseColor?: string
	}) => ({
		...(baseColor
			? dynamicColor(baseColor)
			: { backgroundColor: "transparent", color: theme.cardText }),
		backgroundImage: highlighted ? hoverBackground : "none",
		border: "unset",
		display: "grid",
		gridColumn: "1 / -1",
		gridTemplateColumns: "subgrid",
		gridTemplateRows: "auto auto",
		rowGap: 0,
		alignItems: "center",
		minWidth: 0,
		scrollMargin: "200px",
		textAlign: "left",
		// 10px inset on every side keeps the 36px bullet's 10px radius
		// concentric with the row's 20px radius
		padding: 10,
		borderRadius: 20,
		overflow: "clip",
		position: "relative",
		cursor: "pointer",
		transition: "background 0.15s",

		"&:hover": {
			backgroundImage: hoverBackground,
		},

		"&:active": {
			backgroundImage: activeBackground,
		},

		"&:focus-visible": {
			outline: `2px solid ${theme.controlActiveFill}`,
			outlineOffset: -2,
		},
	}),
)

const contrastText = (color: string) =>
	getLuminance(color) > 0.4 ? "#141814" : "#fff"

const Bullet = styled("span", ({ accent }: { accent?: string }) => ({
	gridColumn: 1,
	gridRow: "1 / 3",
	alignSelf: "start",
	width: 36,
	height: 36,
	borderRadius: 10,
	display: "grid",
	placeItems: "center",
	background: accent ?? theme.cardProminent,
	color: accent ? contrastText(accent) : theme.cardText,

	"& > svg": {
		width: 20,
		height: 20,
	},
}))

const ResultName = styled("span", {
	gridColumn: 2,
	gridRow: 1,
	alignSelf: "end",
	fontSize: 14,
	fontWeight: 500,
	lineHeight: "20px",
	letterSpacing: "-0.005em",
	minWidth: 0,
	overflowWrap: "anywhere",
})

const ResultDetails = styled("span", {
	gridColumn: 2,
	gridRow: 2,
	alignSelf: "start",
	minWidth: 0,
	fontSize: 12,
	lineHeight: "16px",
	color: theme.cardTextMuted,
	overflowWrap: "anywhere",
})

// pinned to the row's top-right corner so the pill chips sit 10px in from
// both edges, concentric with the row
const Identifier = styled("span", {
	gridColumn: 3,
	gridRow: "1 / 3",
	justifySelf: "end",
	alignSelf: "start",
	display: "flex",
	flexWrap: "wrap",
	justifyContent: "end",
	gap: 4,
	minWidth: 0,
})

const Code = styled("span", ({ accent }: { accent?: string }) => ({
	background: accent ?? "transparent",
	color: accent ? contrastText(accent) : theme.cardTextMuted,
	boxShadow: accent ? "none" : `inset 0 0 0 1px ${theme.cardTextMuted}`,
	fontSize: 11,
	fontWeight: 600,
	fontVariantNumeric: "tabular-nums",
	letterSpacing: "0.04em",
	textTransform: "uppercase",
	lineHeight: "20px",
	padding: "0 7px",
	borderRadius: 10,
	whiteSpace: "nowrap",
}))

const NameCodes = styled("span", {
	gridColumn: 2,
	gridRow: 1,
	alignSelf: "end",
	display: "flex",
	flexWrap: "wrap",
	gap: 4,
	minWidth: 0,
})

const NameCode = styled(Code, {
	fontSize: 13,
	whiteSpace: "normal",
	overflowWrap: "anywhere",
})

const PlayerIcon = styled("span", ({ online }: { online: boolean }) => ({
	gridColumn: 1,
	gridRow: "1 / 3",
	alignSelf: "start",
	width: 36,
	height: 36,
	position: "relative",

	"&::after": online
		? {
				content: '""',
				position: "absolute",
				right: -2,
				bottom: -2,
				width: 10,
				height: 10,
				borderRadius: "50%",
				background: "#2EB85C",
				boxShadow: `0 0 0 2px ${theme.cardBackground}`,
			}
		: undefined,
}))

const PlayerHead = styled(Image, {
	display: "block",
	borderRadius: 10,
	imageRendering: "pixelated",
})

const PlayerName = styled(ResultName, { fontWeight: 600 })

const PlayerDetails = styled(ResultDetails, { color: "inherit", opacity: 0.75 })

const PlayerSkeleton = styled("span", {
	background: theme.loaderPulse,
	borderRadius: 4,
	alignSelf: "center",
	animation: "player-color-loading 1.2s ease-in-out infinite alternate",
	"@keyframes player-color-loading": {
		from: { opacity: 0.45 },
		to: { opacity: 1 },
	},
	"@media (prefers-reduced-motion: reduce)": { animation: "none" },
})
