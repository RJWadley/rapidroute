"use client"

import type {
	Place,
} from "app/data"
import type { Coordinate } from "app/data/coordinates"
import Box from "./Box"
import { useRouting, type RouteResult as GlobalRouteResult } from "../providers/RoutingContext"

type LegOptionFromGlobal = GlobalRouteResult['path'][number]['options'][number];
type Leg = GlobalRouteResult['path'][number];

const getPlaceDisplay = (place: Place | Coordinate) => {
	if (place.type === "Coordinate") return place.id
	const code =
		"code" in place && place.code
			? place.code
			: "codes" in place && place.codes
				? place.codes.join(", ")
				: null
	const name = place.name || "Unnamed"
	return code || name !== "Unnamed" ? `${name} ${code ? `(${code})` : `(${place.type})`}` : `${place.type}`
}

const getProviderAndRouteInfo = (option: LegOptionFromGlobal): string => {
	if (!option || !option.route) return "";
	const routeType = option.route.type;
	let providerName = "";
	let routeDetail = "";
	if (option.airline) providerName = option.airline.name ?? "";
	else if (option.company) providerName = option.company.name ?? "";

	if ("code" in option.route && option.route.code) routeDetail = option.route.code;
	else if (routeType !== "SpawnWarp" && option.route.type !== "Walk" && "name" in option.route && option.route.name) routeDetail = option.route.name;

	if (providerName && routeDetail) return `${providerName} (${routeDetail})`;
	if (providerName) return providerName;
	if (routeDetail) return routeDetail;
	return "";
};

type RouteStepDisplayProps = {
	leg: Leg; // Keep leg for from/to places
	legIndex: number;
	bestOption: LegOptionFromGlobal | null; // bestOption can be null if no options
	// We can also pass pre-formatted strings if preferred, but passing objects is fine
};

const RouteStepDisplay: React.FC<RouteStepDisplayProps> = ({ leg, legIndex, bestOption }) => {
	const fromPlaceDisplay = getPlaceDisplay(leg.from);
	const toPlaceDisplay = getPlaceDisplay(leg.to);

	if (!bestOption) {
		return (
			<div className="route-step" style={{ marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '3px solid #cccccc' }}>
				<p>
					<strong style={{ fontSize: '1.05em' }}>Step {legIndex + 1}:</strong> No transport options available from <strong>{fromPlaceDisplay}</strong> to <strong>{toPlaceDisplay}</strong>.
				</p>
			</div>
		);
	}

	if (!bestOption.route) {
		return <div className="route-step error-step" style={{color: 'red'}}><p>Error: Route details missing for Step {legIndex + 1}.</p></div>;
	}

	let actionText: React.ReactNode;
	const providerInfo = getProviderAndRouteInfo(bestOption);

	switch (bestOption.route.type) {
		case "Walk":
			actionText = <>Walk from <strong>{fromPlaceDisplay}</strong> to <strong>{toPlaceDisplay}</strong>.</>;
			break;
		case "SpawnWarp":
			const warpName = "name" in bestOption.route ? bestOption.route.name : "a warp";
			actionText = <>Use <strong>{warpName}</strong> from <strong>{fromPlaceDisplay}</strong> to <strong>{toPlaceDisplay}</strong>.</>;
			break;
		default:
			if (providerInfo) {
				actionText = <>Take <strong>{providerInfo}</strong> from <strong>{fromPlaceDisplay}</strong> to <strong>{toPlaceDisplay}</strong>.</>;
			} else {
				actionText = <>Travel from <strong>{fromPlaceDisplay}</strong> to <strong>{toPlaceDisplay}</strong> using an unspecified {bestOption.route.type}.</>;
			}
			break;
	}

	return (
		<div className="route-step" style={{ marginBottom: '1.25rem', paddingLeft: '1rem', borderLeft: '3px solid #007bff', position: 'relative' }}>
			<span style={{
				position: 'absolute',
				left: '-12px',
				top: '0px',
				background: '#007bff',
				color: 'white',
				borderRadius: '50%',
				width: '22px',
				height: '22px',
				textAlign: 'center',
				lineHeight: '22px',
				fontWeight: 'bold',
				fontSize: '0.9em'
			}}>
				{legIndex + 1}
			</span>
			<p style={{ marginLeft: '15px', paddingBottom: '0.25rem' }}>
				{actionText}
			</p>
			<p style={{ marginLeft: '15px', fontSize: '0.9em', color: '#555' }}>
				<em>(Time for this step: {Math.round(bestOption.time)} seconds)</em>
			</p>
		</div>
	);
};

type ProcessedStepData = {
	key: string | number;
	leg: Leg;
	legIndex: number;
	bestOption: LegOptionFromGlobal | null;
};

export default function SelectedRoute() {
	const { routes, preferredRoute } = useRouting()

	const index = preferredRoute ?? 0
	const result = routes?.[index]

	let processedStepsData: ProcessedStepData[] = [];

	if (result && result.path) {
		processedStepsData = result.path.map((leg, legIndex) => {
			const currentLegOptions = leg.options;
			let bestOption: LegOptionFromGlobal | null = null;

			if (currentLegOptions && currentLegOptions.length > 0) {
				let firstOption = currentLegOptions[0];
				if (firstOption) { // Ensure firstOption is not undefined
					bestOption = firstOption;
					for (let i = 1; i < currentLegOptions.length; i++) {
						const currentOption = currentLegOptions[i];
						if (!currentOption) continue;

						if (currentOption.time < bestOption.time) {
							bestOption = currentOption;
						} else if (currentOption.time === bestOption.time) {
							if (currentOption.route && bestOption.route &&
								currentOption.route.type !== "Walk" && bestOption.route.type === "Walk") {
								bestOption = currentOption;
							}
						}
					}
				}
			}

			return {
				key: leg.id || legIndex,
				leg: leg, // leg is of type Leg (GlobalRouteResult['path'][number])
				legIndex: legIndex,
				bestOption: bestOption
			};
		});
	}

	return (
		<Box isVisible={!!result}>
			{result && (
				<div className="selected-route-details" style={{ padding: '1rem' }}>
					<p style={{ marginBottom: '1.5rem', fontSize: '1.1em', fontWeight: 'bold' }}>
						Result {index + 1}
						<span style={{ color: '#333', marginLeft: '0.5rem', fontWeight: 'normal' }}>(Total time: {Math.round(result.time)} seconds)</span>
					</p>

					{processedStepsData.map(stepData => (
						<RouteStepDisplay
							key={stepData.key}
							leg={stepData.leg}
							legIndex={stepData.legIndex}
							bestOption={stepData.bestOption}
						/>
					))}
				</>
			)}
		</Box>
	);
}
