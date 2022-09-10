import { Location, RouteMode } from "../types";

export interface NodeType {
  id: string;
  time: number;
}

export interface PathType {
  path: Location[];
  time: number;
}

export type TimesMap = {
  [from in keyof RouteMode]: {
    [to in keyof RouteMode]: number;
  };
};

export type PathHeap = PathType[];
