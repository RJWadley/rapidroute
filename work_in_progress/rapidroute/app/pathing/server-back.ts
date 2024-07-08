"use server"

import { findPath } from "."

export const findRouteInServer = async (
	from: string | undefined,
	to: string | undefined,
) => {
	if (!from || !to) return null

	return findPath(from, to)
}
