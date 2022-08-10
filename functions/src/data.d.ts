export interface Database {
  providers: Providers;
  locations: Locations;
  routes: Routes;
  worlds: Worlds;
}

export interface Providers {
  [key: string]: Provider;
}

export interface Provider {
  name: string;
  numberPrefix: string | null;
  description: string | null;
  logo: string | null;
  color: Color;
  owner: string;
  alias: Alias[] | null;
  autoGenerated: boolean;
}

export interface Alias {
  use: string;
  numberRange: NumberRange;
}

export interface NumberRange {
  start: number;
  end: number;
}

export interface Color {
  light: string;
  dark: string;
}

export interface Locations {
  [key: string]: Location;
}

export interface Location {
  name: string;
  shortName: string;
  MRT_TRANSIT_NAME: string | null;
  IATA: string;
  description: string | null;
  location: Coordinates | null;
  owner: string;
  world: string;
  enabled: boolean;
  autoGenerated: boolean;
  type: "City" | "Airport" | "MRT Station" | "Other";
  isSpawnWarp: boolean;
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface Routes {
  [key: string]: Route;
}

export interface Route {
  name: string;
  description: string;
  locations: RouteLocations;
  type: "flight" | "seaplane" | "heli" | "MRT" | "walk" | "spawnWarp";
  autoGenerated: boolean;
  provider: string;
}

export interface RouteLocations {
  [key: string]: string | null;
}

export interface Worlds {
  [key: string]: World;
}

export interface World {
  name: string;
}
