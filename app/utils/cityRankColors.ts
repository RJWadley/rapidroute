import type { CompressedPlace } from "./compressedPlaces"

// Exact rank cell colors from the Members tab of the public MRT member list:
// https://docs.google.com/spreadsheets/d/1Hhj_Cghfhfs8Xh5v5gt65kGc4mDW0sC5GWULKidOBW8/htmlview#gid=1267599469
export const cityRankColors: Partial<
	Record<NonNullable<CompressedPlace["rank"]>, string>
> = {
	Councillor: "#5555ff",
	Mayor: "#0000ff",
	Senator: "#00a500",
	Governor: "#55ff55",
	Premier: "#fff30f",
}
