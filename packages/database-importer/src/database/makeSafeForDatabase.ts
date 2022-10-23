/* eslint-disable @typescript-eslint/consistent-type-assertions */
export const isObject = (
  input: unknown
): input is Record<string | number | symbol, unknown> => {
  return typeof input === "object" && input !== null && !Array.isArray(input)
}

/**
 * recursively replace all undefined values with null
 */
const makeSafeForDatabase = <T>(input: T): SafeForDatabase<T> => {
  if (isObject(input)) {
    const output: Record<string | number | symbol, unknown> = {}
    Object.entries(input).forEach(([key, value]) => {
      output[key] = makeSafeForDatabase(value)
    })
    output.uniqueId = null
    return output as SafeForDatabase<T>
  }
  if (Array.isArray(input)) {
    return input.map(makeSafeForDatabase) as SafeForDatabase<T>
  }
  if (input === undefined) {
    return null as SafeForDatabase<T>
  }
  return input as SafeForDatabase<T>
}

type SafeForDatabase<T> = T extends Record<string | number | symbol, unknown>
  ? {
      [K in keyof T]: SafeForDatabase<T[K]>
    }
  : T extends Array<unknown>
  ? Array<SafeForDatabase<T[number]>>
  : T extends undefined
  ? null
  : T

export default makeSafeForDatabase
