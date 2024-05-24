import type { Equal, Expect } from "temp/utils/type-tests";
import type { RouteType } from "@prisma/client";

export const allRouteTypes = [
	"HelicopterFlight",
	"MRT",
	"PlaneFlight",
	"SeaplaneFlight",
	"Walk",
	"SpawnWarp",
] as const satisfies readonly RouteType[];

/**
 * enforce that every route type is included in the union
 */
type ActualType = (typeof allRouteTypes)[number];
type _Text = Expect<Equal<ActualType, RouteType>>;
