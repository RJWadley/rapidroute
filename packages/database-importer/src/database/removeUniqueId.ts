/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { isObject } from "./makeSafeForDatabase"

export type RemoveUniqueId<T> = Omit<T, "uniqueId">

export type DeepRemoveUniqueId<T> = T extends Array<infer U>
  ? Array<DeepRemoveUniqueId<U>>
  : T extends Record<string, unknown>
  ? { [K in keyof T]: DeepRemoveUniqueId<T[K]> }
  : T extends undefined
  ? undefined
  : T extends null
  ? null
  : RemoveUniqueId<T>

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
