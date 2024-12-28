import { isServer } from "app/utils/isBrowser"
import * as data from "./format"
import type { fetchData } from "./worker"

if (!isServer)
	throw new Error("gatelogue import was used in a non-server environment")

data satisfies DataType
export type DataType = Awaited<ReturnType<typeof fetchData>>

export type * from "./format"
export { data }
