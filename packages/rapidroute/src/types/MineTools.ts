export interface MineTools {
  cache: Cache
  id: null | string
  name: string
  status: string
}

export interface Cache {
  HIT: boolean
  cache_time: number
  cache_time_left: number
  cached_at: number
  cached_until: number
}
