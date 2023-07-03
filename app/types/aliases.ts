import type { Database } from "./supabase"

export type Place = Database["public"]["Tables"]["places"]["Row"]
export type Route = Database["public"]["Tables"]["routes"]["Row"]
export type Provider = Database["public"]["Tables"]["providers"]["Row"]
export type RoutePlace = Database["public"]["Tables"]["routes_places"]["Row"]

export type BarePlace = Omit<Place, "created_at">
export type BareRoute = Omit<Route, "created_at">
export type BareProvider = Omit<Provider, "created_at">
export type BareRoutePlace = Omit<RoutePlace, "id" | "created_at">
