import type { ExcludedRoutes } from "app/data";
import { fetchData } from "app/data/worker";
import { expose } from "comlink";
import { findPath } from ".";

let data: ReturnType<typeof fetchData> | undefined;

const findPathInternal = async ({
	from,
	to,
	excludedRoutes,
}: {
	from: string;
	to: string;
	excludedRoutes: ExcludedRoutes;
}) => {
	if (!data) data = fetchData();
	return findPath(from, to, excludedRoutes, await data);
};

const out = { findPathInternal };
expose(out);
export type WorkerOut = typeof out;
