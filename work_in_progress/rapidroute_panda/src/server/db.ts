import { PrismaClient } from "@prisma/client"

import { localEnv } from "~/env"

const createPrismaClient = () =>
	new PrismaClient({
		log:
			localEnv.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
	})

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (localEnv.NODE_ENV !== "production") globalForPrisma.prisma = db
