const isRecordStringUnknown = (
  input: unknown
): input is Record<string | number, unknown> => {
  return typeof input === "object" && input !== null && !Array.isArray(input)
}

/**
 * recursively replace all undefined values with null
 */
const makeSafeForDatabase = (input: Record<string, unknown>) => {
  const output: Record<string, unknown> = {}
  Object.keys(input).forEach(key => {
    const value = input[key]
    if (value === undefined) {
      output[key] = null
    } else if (typeof value === "object" && isRecordStringUnknown(value)) {
      output[key] = makeSafeForDatabase(value)
    } else {
      output[key] = value
    }
  })
  return output
}

export default makeSafeForDatabase
