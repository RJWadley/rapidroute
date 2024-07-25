export const getRandomColor = async () => {
	const data: { colors: string[] } = await fetch(
		"https://random-flat-colors.vercel.app/api/random?count=5",
	).then((r) => r.json())

	return data.colors[0] ?? "black"
}
