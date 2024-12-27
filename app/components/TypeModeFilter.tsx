import { useRouting } from "./RoutingContext"

export default function TypeModeFilter() {
	const { excludedRoutes, updateExcludedRoutes } = useRouting()
	return (
		<div>
			configure modes:
			{Object.entries(excludedRoutes).map(([type, value]) =>
				Object.entries(value).map(([mode, value]) => (
					<button
						type="button"
						key={mode}
						onClick={() =>
							updateExcludedRoutes({
								type: type as "BusLine",
								mode: mode as "unk",
								value: !value,
							})
						}
					>
						{type} {mode === "unk" ? "other" : mode}: {value ? "off" : "on"}
					</button>
				)),
			)}
		</div>
	)
}
