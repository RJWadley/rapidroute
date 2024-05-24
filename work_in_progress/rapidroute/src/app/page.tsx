"use client"

import { runImport } from "~/server/updater"

export default function Home() {
	return (
		<main>
			hello world
			<button
				type="button"
				onClick={() => {
					runImport().then(console.log)
				}}
			>
				run import
			</button>
		</main>
	)
}
