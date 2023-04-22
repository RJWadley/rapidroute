export const isObject = (
  input: unknown
): input is Record<string | number | symbol, unknown> => {
  return typeof input === "object" && input !== null && !Array.isArray(input)
}

/* recursion in this case requires type assertions */
// TODO /*  @typescript-eslint/consistent-type-assertions */
/**
 * recursively replace all undefined values with null
 * this is because firebase does not allow undefined values
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

/**
 * recursively remove all uniqueId values from an object type
 * output type of makeSafeForDatabase
 */
type SafeForDatabase<T> = T extends Record<string | number | symbol, unknown>
  ? {
      [K in keyof T]: SafeForDatabase<T[K]>
    }
  : T extends unknown[]
  ? SafeForDatabase<T[number]>[]
  : T extends undefined
  ? null
  : T

export default makeSafeForDatabase
