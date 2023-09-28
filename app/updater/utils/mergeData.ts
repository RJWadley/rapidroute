import { isRecord } from "./deepCompare"

type MergableData = {
  manual_keys?: string[]
} & Record<string | number | symbol, unknown>

/**
 * Merge old data with new data, while preserving manual keys
 */
export default function mergeData<
  A extends MergableData,
  B extends MergableData,
>(oldData: A | undefined, newData: B): B | (A & B) {
  if (!oldData) return newData

  const manualKeys = oldData.manual_keys
  const manualValues = manualKeys?.map((key) => [key, oldData[key]] as const)

  // we don't want null values to overwrite old data
  const newDataWithoutNulls = Object.fromEntries(
    Object.entries(newData).filter(([, value]) => value !== null),
  )

  const newDataDeeplyMerged = Object.fromEntries(
    Object.entries(newDataWithoutNulls).map(([key, value]) => {
      const oldValue = oldData[key]
      if (isRecord(oldValue) && isRecord(value)) {
        return [key, mergeData(oldValue, value)]
      }
      return [key, value]
    }),
  )

  return {
    ...newData,
    ...oldData,
    ...newDataDeeplyMerged,
    ...Object.fromEntries(manualValues ?? []),
    manual_keys: manualKeys,
  }
}
