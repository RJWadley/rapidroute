export interface Worlds {
  [key: string]: Partial<World>
}

export interface World {
  uniqueId: string
  name: string
}
