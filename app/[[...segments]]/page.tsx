"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { CompressedPlace } from "app/todo/utils/compressedPlaces"
import Link from "next/link"
import { Suspense, use } from "react"

export default function SegmentHandler({
	params,
}: { params: Promise<{ segments: string[] | undefined }> }) {
	const segments = use(params).segments

	const { data: compressedPlaces } = useSuspenseQuery<CompressedPlace[]>({
		queryKey: ["compressed-places"],
	})

	return (
		<div>
			Segment Handler: {segments?.join("/") ?? "root layout"}
			<br />
			navigate to a route:
			<br />
			<Link href="/a/b/c">/a/b/c</Link>
			<br />
			<Link href="/a">/a</Link>
			<br />
			<Link href="/">root</Link>
			<br />
			<Suspense fallback="loading...">
				place count: {compressedPlaces?.length}
			</Suspense>
		</div>
	)
}
