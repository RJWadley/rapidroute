"use client"

import { useQuery } from "@tanstack/react-query"
import { getRandomColor } from "./sample-api"

export function Demo() {
	const { data: color } = useQuery({
		queryKey: ["color"],
		queryFn: getRandomColor,
	})

	return (
		<>
			hi! here's a random color:
			{color ? <div style={{ background: color }}>{color}</div> : "loading..."}
		</>
	)
}
