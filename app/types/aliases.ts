import type { Database } from "./supabase"

export type Place = Database["public"]["Tables"]["places"]["Row"]
export type Route = Database["public"]["Tables"]["routes"]["Row"]
export type Provider = Database["public"]["Tables"]["providers"]["Row"]
