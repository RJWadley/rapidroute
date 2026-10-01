import { z } from "zod"

export const wikiInputSchema = z.object({
	name: z.string().trim().min(1).max(200),
	context: z
		.object({
			id: z.string().max(200).optional(),
			type: z.string().max(100).optional(),
			codes: z.array(z.string().max(100)).max(20).optional(),
			company: z.string().max(200).optional(),
			world: z.string().max(100).optional(),
			coordinates: z
				.tuple([z.number().finite(), z.number().finite()])
				.optional(),
			mayor: z.string().max(200).optional(),
		})
		.optional(),
})

export type WikiContext = z.infer<typeof wikiInputSchema>["context"]
