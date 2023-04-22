/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { isObject } from "./makeSafeForDatabase"

export type RemoveUniqueId<T> = Omit<T, "uniqueId">

/**
 * recursively remove all uniqueId keys from an object type
 * output type of removeUniqueId
 */
export type DeepRemoveUniqueId<T> = T extends (infer U)[]
  ? DeepRemoveUniqueId<U>[]
  : T extends Record<string, unknown>
  ? { [K in keyof RemoveUniqueId<T>]: DeepRemoveUniqueId<T[K]> }
  : T

/**
 * recursively remove all uniqueId values from an object type
 * these are used as object keys in firebase, so there's no need to store them twice
 */
export const removeUniqueId = <T>(input: T): DeepRemoveUniqueId<T> => {
  if (Array.isArray(input)) {
    return input.map(removeUniqueId) as DeepRemoveUniqueId<T>
  }
  if (isObject(input)) {
    const output = {} as Record<keyof T, unknown>
    Object.entries(input).forEach(([key, value]) => {
      if (key !== "uniqueId") {
        output[key as keyof T] = removeUniqueId(value)
      }
    })
    return output as DeepRemoveUniqueId<T>
  }
  return input as DeepRemoveUniqueId<T>
}
