import { z } from "zod"
import { findPath } from "."

const messageSchema = z.object({
	from: z.string(),
	to: z.string(),
	id: z.string(),
})

self.addEventListener("message", (event) => {
	try {
		const { from, to, id } = messageSchema.parse(event.data)

		const result = findPath(from, to)

		self.postMessage({
			id,
			result,
		})
	} catch (error) {
		self.postMessage({
			id: event.data.id,
			error,
		})
	}
})
