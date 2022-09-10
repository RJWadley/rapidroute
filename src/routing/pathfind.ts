/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { getAll } from "../data/getData";
import { PathfindingEdge } from "../types";
import { shortHandMap } from "../types/pathfinding";
import getRouteTime from "./getRouteTime";
import PriorityQueue from "./PriorityQueue";

const rawEdges = getAll("pathfinding");

interface Result {
  path: PathfindingEdge[];
  totalCost: number;
}

export default class Pathfind {
  start: string;

  end: string;

  constructor(start: string, end: string) {
    this.start = start;
    this.end = end;
  }

  async search(): Promise<Result> {
    const frontier = new PriorityQueue<string>();
    const edges = Object.values(await rawEdges);
    frontier.enqueue(this.start, 0);
    const cameFrom: Record<string, string> = {};
    const costSoFar: Record<string, number> = {};
    costSoFar[this.start] = 0;

    while (!frontier.isEmpty()) {
      const current = frontier.dequeue();

      if (current === this.end || current === undefined) {
        break;
      }

      const currentEdges = edges.filter((edge) => edge.f === current);

      for (const edge of currentEdges) {
        const newCost =
          costSoFar[current] + getRouteTime(edge.d, shortHandMap[edge.m]);
        if (costSoFar[edge.t] === undefined || newCost < costSoFar[edge.t]) {
          costSoFar[edge.t] = newCost;
          const priority = newCost;
          frontier.enqueue(edge.t, priority);
          cameFrom[edge.t] = current;
        }
      }
    }

    const path = this.reconstructPath(cameFrom);
    const totalCost = costSoFar[this.end];

    return {
      path,
      totalCost,
    };
  }

  reconstructPath(cameFrom: Record<string, string>): PathfindingEdge[] {
    const path: PathfindingEdge[] = [];
    const edges = Object.values(rawEdges);

    console.log("reconstructing path!");

    let current = this.end;
    const findEdge: (f: string, t: string) => PathfindingEdge | undefined = (
      f,
      t
    ) => edges.find((edge) => edge.f === f && edge.t === t);

    while (current !== this.start) {
      const previous = cameFrom[current];
      const edge = findEdge(previous, current);
      if (edge === undefined) {
        throw new Error("Pathfinding error");
      }
      path.push(edge);
      current = previous;
    }

    path.reverse();
    return path;
  }
}
