import { DatabaseType } from "@rapidroute/database-types"
import { isWholeAutoGenIndex } from "@rapidroute/database-types/dist/src/autoGenIndex"

import { subscribe, write } from "./database"
import makeSafeForDatabase from "./makeSafeForDatabase"

let autoGenIndex: DatabaseType["autoGenIndex"] | undefined

subscribe("autoGenIndex", newValue => {
  if (newValue === null || newValue === undefined) {
    autoGenIndex = {}
  }
  if (isWholeAutoGenIndex(newValue)) {
    autoGenIndex = newValue
  }
})

export default async function updateAutoGen(
  type: "routes" | "locations" | "providers",
  previous:
    | {
        autoGenerated?: boolean | string
        uniqueId: string
      }
    | null
    | undefined,
  newValue:
    | {
        autoGenerated?: boolean | string
        uniqueId: string
      }
    | null
    | undefined
) {
  if (!autoGenIndex) {
    throw new Error("AutoGenIndex not initialized")
  }
  if (previous) {
    const sourceAsKey =
      previous.autoGenerated === true
        ? "true"
        : previous.autoGenerated || "false"
    const oldValue = autoGenIndex[sourceAsKey]?.[type]
    autoGenIndex[sourceAsKey] = {
      ...autoGenIndex[sourceAsKey],
      [type]: oldValue?.filter(id => id !== previous.uniqueId),
    }
  }
  if (newValue) {
    const sourceAsKey =
      newValue.autoGenerated === true
        ? "true"
        : newValue.autoGenerated || "false"
    const oldValue = autoGenIndex[sourceAsKey]?.[type]
    autoGenIndex[sourceAsKey] = {
      ...autoGenIndex[sourceAsKey],
      [type]: oldValue ? [...oldValue, newValue.uniqueId] : [newValue.uniqueId],
    }
  }

  if (previous || newValue)
    await write("autoGenIndex", makeSafeForDatabase(autoGenIndex))
}
