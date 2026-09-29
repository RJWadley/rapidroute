import { data } from "app/data"
import { resolveLogos } from "app/data/logos"

/**
 * resolving logos crawls the whole wiki file list, so do it ahead of time and refresh daily
 */
export const revalidate = 86400

export const GET = async () => Response.json(await resolveLogos(data))
