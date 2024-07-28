/**
 * race promises and log which promise wins
 */
export const racePromisesWithLog = async <T>(
	promises: { name: string; promise: Promise<T> | null }[],
) => {
	let hasWinner = false

	const loggablePromises = promises.map(({ name, promise }) =>
		promise?.then(() => {
			if (hasWinner) return
			hasWinner = true

			// TODO report this as analytics
			console.log(`RACE RESULT: ${name} was faster!`)
			return promise
		}),
	)

	const winner = await Promise.race(loggablePromises)
	return winner ?? null
}
