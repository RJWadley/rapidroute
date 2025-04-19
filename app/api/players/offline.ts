import { z } from "zod"
import type { OfflinePlayer } from "./type"

const rank = z.enum([
	"Administrator",
	"Citizen",
	"Councillor",
	"",
	"Governor",
	"Mayor",
	"Member",
	"Moderator",
	"Owner",
	"Premier",
	"Senator",
	"Trustee",
])
const offlineSchema = z.array(
	z.object({
		Rank: rank,
		Username: z.union([z.string(), z.number()]).transform((v) => v.toString()),
	}),
)

export const getOfflinePlayers = async (): Promise<
	Record<string, OfflinePlayer>
> => {
	const response = await fetch(
		"https://script.googleusercontent.com/macros/echo?user_content_key=NeftXMjnaaBSg1_JRtSWaSCs3U-0XG4DCNJ7XXt5y26UuK0kfAf8NbXmbKXzsDqQl-qHTPYGzi1CvMIFs5rAJLzdYg1HT99LOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMWojr9NvTBuBLhyHCd5hHa_NRaJqKeKx8N66BjnSxpXpoJKQ3SGobotVtpOclafjZ4ii-NhRVgD-8bKhcMOJPHE3GhvdtfHCXUbh3Nlg6pIM9ahK_kgrcajYVvTXA5rrYQN_Pg4ZQwX91fRVN0sE9PpuU4W4X8Ds-7RsH8ZISKe7WnpR6LsjJ2u9hcaL8DDkC3fFEjCD3K7nIEB_jcADA_w&lib=MMKS_-5liUoh_6_qwm6HHwlScKf4pGqo7",
		{ cache: "force-cache" },
	).then((res) => res.json())

	const { success, data, error } = offlineSchema.safeParse(response)

	if (success)
		return Object.fromEntries(
			data
				.map((player) => player.Username)
				.sort(() => Math.random() - 0.5)
				.map(
					(username) =>
						[
							`player-${username.toLowerCase()}`,
							{
								id: `player-${username.toLowerCase()}`,
								isOnline: false,
								type: "Player",
								username,
							} satisfies OfflinePlayer,
						] as const,
				),
		)

	console.error("failed to parse offline players", error)
	return {}
}
