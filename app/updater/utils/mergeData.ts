type MergableData = {
  manual_keys: string[]
} & Record<string | number | symbol, unknown>

/**
 * Merge old data with new data, while preserving manual keys
 */
export default function mergeData<
  A extends MergableData,
  B extends MergableData
>(oldData: A, newData: B): A & B {
  const manualKeys = oldData.manual_keys
  const manualValues = manualKeys.map((key) => [key, oldData[key]] as const)

  // we don't want null values to overwrite old data
  const newDataWithoutNulls = Object.fromEntries(
    Object.entries(newData).filter(([, value]) => value !== null)
  ) as B

  return {
    ...newData,
    ...oldData,
    ...newDataWithoutNulls,
    ...Object.fromEntries(manualValues),
    manual_keys: manualKeys,
  }
}