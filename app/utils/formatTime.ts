/**
 * given a time in seconds, return a string formatted with a single unit
 * for example, if the time is 120 seconds, return "2 min"
 * if the time is less than a minute, return "1 sec"
 *
 * we only need to handle seconds, minutes, and hours
 */
export const formatTime = (time: number) => {
	if (time < 60) return `${Math.round(time)} sec`
	if (time < 3600) return `${Math.round(time / 60)} min`
	return `${Math.round(time / 3600)} hr`
}
