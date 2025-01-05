import type { Coordinate } from "app/data/coordinates";
import { useDeferredValue, useMemo } from "react";
import type { CompressedPlace } from "./compressedPlaces";
import { type OnlinePlayer, useOnlinePlayers } from "./onlinePlayers";
import { search } from "./search";

export const useSearchResults = <T extends Partial<CompressedPlace>>(
	rawQuery: string | undefined | null,
	initialPlaces: T[],
): (T | Coordinate | OnlinePlayer)[] => {
	const query = useDeferredValue(rawQuery);

	const { data: players } = useOnlinePlayers();

	const results = useMemo(
		() =>
			query ? search(query, initialPlaces, Object.values(players ?? {})) : null,
		[query, initialPlaces, players],
	);

	const randomPlaces = useMemo(() => {
		const shuffled = [...initialPlaces].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 10);
	}, [initialPlaces]);

	return results ? results.map((r) => r.obj) : randomPlaces;
};
