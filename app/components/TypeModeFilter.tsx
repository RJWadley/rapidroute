import { useRouting } from "./RoutingContext"

export default function TypeModeFilter() {
	const { excludedRoutes, updateExcludedRoutes } = useRouting()
	return (
		<div>
			configure modes:
			{Object.entries(excludedRoutes).map(([mode, value]) => (
				<button
					type="button"
					key={mode}
					onClick={() =>
						updateExcludedRoutes({
							type: "set",
							mode: mode as keyof typeof excludedRoutes,
							value: !value,
						})
					}
				>
					{mode}: {value ? "off" : "on"}
				</button>
			))}
		</div>
	)
}
