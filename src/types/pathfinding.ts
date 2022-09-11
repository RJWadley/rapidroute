export interface Pathfinding {
  [key: string]: PathingPlace;
}

export type PathingPlace = {
  /**
   * all locations reachable from this location via this mode of transport
   *
   * value key: route location
   * value value: routeIds that can be used to get to that location
   */
  [key in keyof typeof shortHandMap]: null | Record<string, string[]>;
} & {
  /**
   * should match the database key and the uniqueId of the location
   */
  uniqueId: string;
  /**
   * the X coordinate of the location
   */
  x: number | null;
  /**
   * the Z coordinate of the location
   */
  z: number | null;
};

export const shortHandMap = {
  F: "flight",
  S: "seaplane",
  H: "heli",
  M: "MRT",
} as const;

export const reverseShortHandMap = {
  flight: "F",
  seaplane: "S",
  heli: "H",
  MRT: "M",
} as const;
