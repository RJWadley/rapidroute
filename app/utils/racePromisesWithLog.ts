/**
 * race promises and log which promise wins
 */
export const racePromisesWithLog = async <T>(
	promises: { name: string; promise: Promise<T> | null }[],
): Promise<T | null> => {
	let hasWinner = false
	const startTime = performance.now()

	const loggablePromises = promises.map(({ name, promise }) =>
		promise
			?.then((result) => {
				const elapsedTime = performance.now() - startTime

				// TODO report this as analytics
				if (hasWinner) {
					console.log(
						`RACE RESULT: ${name} was skipped, took ${elapsedTime.toFixed(1)}ms`,
					)
				} else {
					console.log(
						`RACE RESULT: ${name} was faster! Took ${elapsedTime.toFixed(1)}ms`,
					)
				}

				hasWinner = true
				return result
			})
			.catch((error) => {
				console.error(`RACE ERROR: ${name}`, error)
			}),
	)

	const winner = await Promise.any(loggablePromises)
	return winner ?? null
}
