import { useQuery } from "@tanstack/react-query"
import { getClosestPlaces } from "app/pathing/getClosestPlaces"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { getImageColor } from "app/utils/getImageColor"
import type { OfflinePlayer } from "app/utils/offlinePlayers"
import type { OnlinePlayer } from "app/utils/onlinePlayers"
import { dynamicColor, theme } from "app/utils/theme"
import { useRef } from "react"
import { styled } from "restyle"
import type useSearchBox from "./useSearchBox"

type SortedPlace = NonNullable<
	ReturnType<typeof useSearchBox<CompressedPlace>>["searchResults"]
>[number]

function Player({ player }: { player: OnlinePlayer | OfflinePlayer }) {
	const { data: compressedPlaces } = useQuery<CompressedPlace[]>({
		queryKey: ["compressed-places"],
	})
	const {
		data: color,
		isError,
		isPending,
	} = useQuery({
		queryKey: ["color", player.name],
		queryFn: async () => {
			if (!player.name) return null
			const color = await getImageColor(
				`https://mc-heads.net/avatar/${player.name}.png`,
			)
			return color
		},
	})

	const loaderRef = useRef<HTMLDivElement>(null)

	if (isError) return "Failed to load player"
	if (!compressedPlaces || !color) return <Loader ref={loaderRef} />

	const [closestPlace] =
		player.type === "OnlinePlayer"
			? getClosestPlaces(
					player.coordinates,
					compressedPlaces.filter(
						(place) => place.type === "Town" || place.type === "AirAirport",
					),
				)
			: [null]

	return (
		<>
			<PlayerHead
				src={`https://mc-heads.net/avatar/${player.name}.png`}
				alt={player.name}
			/>
			<PlayerName baseColor={color}>{player.name}</PlayerName>
			{player.type === "OfflinePlayer" ? (
				<OfflineTag>OFFLINE</OfflineTag>
			) : closestPlace ? (
				`${
					closestPlace.distance < 500
						? closestPlace.place.type === "Town"
							? "In"
							: "At"
						: closestPlace.distance < 2000
							? "Near"
							: "Wilderness near"
				} ${closestPlace.place.name}`
			) : (
				`at ${Math.round(player.coordinates[0])}, ${Math.round(player.coordinates[1])}`
			)}
		</>
	)
}

export default function SearchResult({ place }: { place: SortedPlace }) {
	return (
		<Wrapper
			type="button"
			onClick={place.selectItem}
			key={place.id}
			highlighted={place.highlighted}
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
			{place.type === "OnlinePlayer" || place.type === "OfflinePlayer" ? (
				<Player player={place} />
			) : place.type === "Coordinate" ? (
				"coordinate"
			) : (
				place.name
			)}
		</Wrapper>
	)
}

const Wrapper = styled(
	"button",
	({ highlighted }: { highlighted: boolean }) => ({
		background: highlighted ? theme.cardHover : "transparent",
		border: "unset",
		display: "flex",
		alignItems: "center",
		gap: 16,
		scrollMargin: "200px",
		textAlign: "left",
		padding: 8,
		margin: -8,
		minHeight: 24 + 8 + 8,
		borderRadius: 12,
		overflow: "clip",
		position: "relative",
		wordBreak: "break-word",

		"&:hover": {
			background: theme.cardHover,
		},

		"&:last-child": {
			borderRadius: "12px 12px 20px 20px",
		},
	}),
)

const Loader = styled("div", {
	position: "absolute",
	inset: 4,
	background: theme.loaderPulse,
	borderRadius: 8,
})

const PlayerHead = styled("img", {
	width: 24,
	height: 24,
	borderRadius: 4,
})

const PlayerName = styled("div", ({ baseColor }: { baseColor: string }) => ({
	...dynamicColor(baseColor),
	padding: "3px 8px",
	borderRadius: 8,
	fontWeight: "bold",
	fontSize: 12,
	flexShrink: 0,
}))

const OfflineTag = styled("div", {
	color: theme.cardTextMuted,
	fontWeight: 500,
	fontSize: 10,
	flexShrink: 0,
})
