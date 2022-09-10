export interface Pathfinding {
  [key: string]: PathfindingEdge;
}

export interface PathfindingEdge {
  /**
   * should match the database key
   */
  uniqueId: string;
  /**
   * the FROM location of this edge
   */
  f: string;
  /**
   * the TO location of this edge
   */
  t: string;
  /**
   * the mode of this edge
   */
  m: keyof typeof shortHandMap;
  /**
   * the manhattan distance between the two locations
   * if negative, one of the locations does not have a position and the distance should be treated as unknown
   */
  d: number;
}

export const shortHandMap = {
  F: "flight",
  S: "seaplane",
  H: "heli",
  M: "MRT",
  W: "walk",
} as const;

export const reverseShortHandMap = {
  flight: "F",
  seaplane: "S",
  heli: "H",
  MRT: "M",
  walk: "W",
} as const;
