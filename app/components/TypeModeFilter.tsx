import { styled } from "restyle"
import { useRouting } from "../providers/RoutingContext"
import {
	DisclosureProvider,
	Disclosure,
	DisclosureContent,
} from "@ariakit/react"
import { eases } from "app/utils/eases"
import { Reset } from "app/icons/reset"
import { Tune } from "app/icons/tune"
import { motion } from "motion/react"
import { theme } from "app/utils/theme"

// biome-ignore lint/suspicious/noExplicitAny: some types here are impossible to check
type Uncheckable = any

const typeToString = (typeMode: string) => {
	switch (typeMode) {
		case "AirFlight":
			return "Air Travel"
		case "RailLine":
			return "Rail Travel"
		case "SeaLine":
			return "Water Travel"
		case "BusLine":
			return "Bus Travel"
		case "Walk":
			return "Walking Connections"
		case "SpawnWarp":
			return "Teleportation"

		case "AirFlighthelicopter":
			return "Helicopters"
		case "AirFlightseaplane":
			return "Seaplanes"
		case "AirFlightwarpPlane":
			return "Standard Planes"
		case "AirFlightunk":
			return "Uncategorized"

		case "RailLinewarp":
			return "Warp Rail"
		case "RailLineunk":
			return "Uncategorized"

		case "SeaLineferry":
			return "Ferries"
		case "SeaLineunk":
			return "Uncategorized"

		case "BusLineunk":
			return "Uncategorized"

		case "WalkatRouteStart":
			return "Walking as First Step"
		case "WalkatRouteEnd":
			return "Walking as Last Step"
		case "Walkmiddle":
			return "Other Walking"

		case "SpawnWarpportal":
			return "World Portals"
		case "SpawnWarppremier":
			return "Premier Cities"
		case "SpawnWarpterminus":
			return "Line Terminus"
		case "SpawnWarpmisc":
			return "Other Warps"
	}

	return `mode name not supported: ${typeMode}`
}

export default function TypeModeFilter({
	children,
}: { children: React.ReactNode }) {
	const { excludedRoutes, updateExcludedRoutes } = useRouting()

	const allCombos = Object.entries(excludedRoutes).flatMap(([type, value]) =>
		Object.entries(value).map(([mode, value]) => ({ type, mode, value })),
	)
	const allTypes = Array.from(new Set(allCombos.map((x) => x.type))).map(
		(type) => ({
			type,
			disabled:
				//  true if all modes of this type are excluded from routing
				allCombos
					.filter((x) => x.type === type)
					.every((x) => x.value),
		}),
	)

	return (
		<Wrapper>
			<DisclosureProvider>
				<Row>
					<PassiveTrigger>{children}</PassiveTrigger>
					<ResetTrigger>
						<Reset />
					</ResetTrigger>
					<ActiveTrigger>
						<Tune />
					</ActiveTrigger>
				</Row>
				<Content>
					<div>
						<Title>Filter by Route Type</Title>

						{Array.from(allTypes).map(({ type, disabled }) => (
							<Group key={type}>
								<Toggle
									nested={false}
									onClick={() => {
										for (const combo of allCombos) {
											if (combo.type === type) {
												updateExcludedRoutes({
													type: type as Uncheckable,
													mode: combo.mode,
													value: !disabled,
												})
											}
										}
									}}
									whileTap={{
										scale: 0.98,
									}}
								>
									{typeToString(type)}
									<Switch active={!disabled}>
										<Knob
											active={!disabled}
											layout
											transition={{
												type: "spring",
												visualDuration: 0.2,
												bounce: 0.2,
											}}
										/>
									</Switch>
								</Toggle>

								{allCombos
									.filter((x) => x.type === type)
									.map(({ mode, value: excluded }, _, all) => (
										<Toggle
											nested
											key={mode}
											onClick={() => {
												updateExcludedRoutes({
													type: type as Uncheckable,
													mode: mode,
													value: !excluded,
												})
											}}
											whileTap={{
												scale: 0.98,
											}}
										>
											{typeToString(type + mode)}
											<Switch active={!excluded}>
												<Knob
													active={!excluded}
													layout
													transition={{
														type: "spring",
														visualDuration: 0.2,
														bounce: 0.2,
													}}
												/>
											</Switch>
										</Toggle>
									))}
							</Group>
						))}
					</div>
				</Content>
			</DisclosureProvider>
		</Wrapper>
	)
}

const Wrapper = styled(motion.div)

const Title = styled("h1", {
	fontSize: 24,
	fontWeight: 500,
	padding: "16px",
})

const triggerStyle = {
	display: "block",
	padding: "8px 12px",
	textAlign: "left",
	background: "none",
	border: "none",
	borderRadius: 16,
	transition: "background 0.2s",
	"&:hover": {
		background: theme.cardHover,
	},
	"&:active": {
		background: theme.cardActive,
	},
} as const

const PassiveTrigger = styled(Disclosure, {
	...triggerStyle,
	background: "none !important",
})

const ActiveTrigger = styled(Disclosure, triggerStyle)
const ResetTrigger = styled("button", triggerStyle)

const Row = styled("div", {
	display: "grid",
	gridTemplateColumns: "1fr auto auto",
	padding: 16,
})

const Content = styled(DisclosureContent, {
	display: "grid",
	gridTemplateRows: "0fr",
	transition: `grid-template-rows 500ms ${eases.cubic.out}`,

	"&[data-enter]": {
		gridTemplateRows: "1fr",
	},

	"& > *": {
		overflow: "clip",
		gridRow: "1 / span 2",
	},
})

const Group = styled("div", {
	margin: "16px 0",
	display: "grid",
})

const Toggle = styled(motion.button, ({ nested }: { nested: boolean }) => ({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	paddingLeft: nested ? 16 : 12,
	background: "transparent",
	border: "none",

	...(nested
		? {
				padding: "8px 12px",
			}
		: {
				background: theme.controlHeadingBackground,
				padding: "16px",
				paddingLeft: 20,
				margin: "12px",
				borderRadius: 24,
				fontWeight: "500",
			}),
}))

const Switch = styled("div", ({ active }: { active: boolean }) => ({
	width: 52,
	height: 32,
	borderRadius: 50,
	cursor: "pointer",
	display: "flex",
	justifyContent: active ? "end" : "start",
	padding: active ? (32 - 24 - 4) / 2 : (32 - 16 - 4) / 2,
	transition: "border-color 0.2s, background 0.2s",

	background: active ? theme.controlActiveFill : theme.controlNeutralFill,
	border: `2px solid ${active ? theme.controlActiveFill : theme.controlNeutralStroke}`,
}))

const Knob = styled(motion.div, ({ active }: { active: boolean }) => ({
	width: active ? 24 : 16,
	height: active ? 24 : 16,
	borderRadius: "50%",

	backgroundColor: active
		? theme.controlNeutralFill
		: theme.controlNeutralStroke,
}))
