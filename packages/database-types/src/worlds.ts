/**
 * this file is currently unused
 */

import TSON from "typescript-json"

export interface Worlds {
  [key: string]: World
}

export interface World {
  uniqueId: string
  name: string
}

export const isWorld = (obj: unknown): obj is World => TSON.is<World>(obj)
