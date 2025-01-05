"use client";

import { Application, extend } from "@pixi/react";
import { useEventListener } from "ahooks";
import type { CompressedPlace } from "app/utils/compressedPlaces";
import { Container, Graphics } from "pixi.js";
import { use, useRef } from "react";
import { styled } from "restyle";
import { MovementContext } from "../MapMovement";
import Cities from "./Cities";
import DynmapMarkers from "./Dynmap/DynmapMarkers";
import type { MarkersResponse } from "./Dynmap/dynmapType";
import PixiViewport from "./PixiViewport";
import MapPlayers from "./Players";
import Satellite from "./Satellite";
import { PixiHooks } from "./pixiUtils";

extend({
	Container,
	Graphics,
});

export default function MapClient({
	initialMarkers,
	compressedPlaces,
}: {
	initialMarkers: MarkersResponse;
	compressedPlaces: CompressedPlace[];
}) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const { lastUsedMethod } = use(MovementContext);

	/**
	 * prevent scroll events from bubbling up to the document
	 */
	useEventListener(
		"wheel",
		(e) => {
			if (e.target instanceof HTMLCanvasElement) {
				e.preventDefault();
			}
		},
		{ passive: false },
	);

	/**
	 * prevent selection of app text while dragging
	 */
	useEventListener(
		"pointerdown",
		(e) => {
			if (e.target instanceof HTMLCanvasElement) {
				e.preventDefault();
			}
		},
		{ passive: false },
	);

	const touchStart = () => {
		lastUsedMethod.current = "touchStillActive";
	};
	const touchEnd = () => {
		lastUsedMethod.current = "touch";
	};

	return (
		<Wrapper
			ref={wrapperRef}
			onTouchStart={touchStart}
			onTouchEnd={touchEnd}
			onPointerDown={touchStart}
			onPointerUp={touchEnd}
			onWheel={touchEnd}
		>
			<Background />
			<Application
				antialias
				autoDensity
				resizeTo={wrapperRef}
				backgroundAlpha={0}
				resolution={typeof window !== "undefined" ? window.devicePixelRatio : 1}
			>
				<PixiViewport>
					<PixiHooks />
					<Satellite />
					<DynmapMarkers initialMarkers={initialMarkers} />
					<MapPlayers />
					<Cities places={compressedPlaces} />
				</PixiViewport>
			</Application>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	position: "absolute",
	inset: "0",
	width: "100%",
	height: "100%",
	zIndex: "1",
	overflow: "clip",
});

const Background = styled("div", {
	position: "absolute",
	inset: 0,
	zIndex: -2,
	background: "#546461",
});
