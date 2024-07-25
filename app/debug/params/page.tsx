"use client"

import { useSearchParamState } from "app/utils/useSearchParamState"

export default function Application() {
	const [a, setA] = useSearchParamState("a")
	const [secondA, setSecondA] = useSearchParamState("a")
	const [b, setB] = useSearchParamState("b")

	return (
		<div>
			search params
			<div>
				a: {a}
				<input value={a ?? ""} onChange={(e) => setA(e.target.value)} />
			</div>
			<div>
				b: {b}
				<input value={b ?? ""} onChange={(e) => setB(e.target.value)} />
			</div>
			<div>
				second a: {secondA}
				<input
					value={secondA ?? ""}
					onChange={(e) => setSecondA(e.target.value)}
				/>
			</div>
		</div>
	)
}
