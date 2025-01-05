export const getRandomColor = async () => {
	const data = await fetch(
		"https://random-flat-colors.vercel.app/api/random?count=5",
	).then((r) => r.json() as Promise<{ colors: string[] }>)

	return data.colors[0] ?? "black"
}
