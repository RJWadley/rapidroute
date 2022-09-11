/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { getAll } from "../data/getData";
import { PathfindingEdge } from "../types";
import { Pathfinding, shortHandMap } from "../types/pathfinding";
import getRouteTime from "./getRouteTime";
import PriorityQueue from "./PriorityQueue";
import { getDistance, throttle } from "./util";

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  routes?: string[];
}

const rawEdges = getAll("pathfinding").then((data) => {
  const edgeIds = Object.keys(data);

  // for each route type in each nodes, generate edges to all listed nodes
  const routeEdges: GraphEdge[] = edgeIds.flatMap((from) => {
    const shortTypes = Object.keys(
      shortHandMap
    ) as (keyof typeof shortHandMap)[];
    return shortTypes.flatMap((routeTypeShort) => {
      const routes = data[from][routeTypeShort];

      if (routes) {
        return Object.entries(routes).flatMap(([to, routeIds]) => {
          const x1 = data[from].x;
          const y1 = data[from].z;
          const x2 = data[to].x;
          const y2 = data[to].z;
          const distance =
            x1 && y1 && x2 && y2 ? getDistance(x1, y1, x2, y2) : Infinity;
          const weight = getRouteTime(distance, shortHandMap[routeTypeShort]);

          return [{ from, to, weight, routes: routeIds }];
        });
      }
      return [];
    });
  });

  // for each node, generate 5 walking edges to the closest nodes
  const walkingEdges: GraphEdge[] = edgeIds.flatMap((from) => {
    const x1 = data[from].x;
    const y1 = data[from].z;
    const distances = edgeIds
      .filter((to) => to !== from)
      .map((to) => {
        const x2 = data[to].x;
        const y2 = data[to].z;
        const distance =
          x1 && y1 && x2 && y2 ? getDistance(x1, y1, x2, y2) : Infinity;
        return { to, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(({ to, distance }) => {
        const weight = getRouteTime(distance, "walk");
        return { from, to, weight };
      });

    return distances;
  });

  return [...walkingEdges, ...routeEdges];
});
const rawNodes = getAll("pathfinding");

export default class Pathfinder {
  from: string;

  to: string;

  maxCost: number = Infinity;

  EXTRA_TIME = 100;

  distanceTravelled = 0;

  cancelled = false;

  constructor(from: string, to: string) {
    this.from = from;
    this.to = to;
  }

  async findPath(): Promise<string[]> {
    const frontier = new PriorityQueue<string>();
    const cameFrom: Record<string, string> = {};
    const costSoFar: Record<string, number> = {};
    const edges = await rawEdges;
    const nodes = await rawNodes;

    frontier.enqueue(this.from, 0);
    costSoFar[this.from] = 0;

    const start = performance.now();
    while (!frontier.isEmpty() && !this.cancelled) {
      await throttle();
      const current = frontier.dequeue();

      if (current === this.to || current === undefined) {
        break;
      }

      await this.updateMaxCost(nodes, current, costSoFar[current]);
      this.distanceTravelled = Math.max(
        this.distanceTravelled,
        costSoFar[current]
      );

      edges
        .filter((edge) => edge.from === current)
        .filter((edge) => costSoFar[current] + edge.weight < this.maxCost)
        .forEach(async (edge) => {
          const newCost = costSoFar[current] + edge.weight;
          this.updateMaxCost(nodes, edge.to, newCost);

          if (newCost > this.maxCost) return;
          if (!costSoFar[edge.to] || newCost < costSoFar[edge.to]) {
            costSoFar[edge.to] = newCost;
            const priority = newCost;
            frontier.enqueue(edge.to, priority);
            cameFrom[edge.to] = current;
          }
        });
    }

    const path: string[] = [];
    let current = this.to;
    while (current !== this.from && current) {
      path.push(current);
      current = cameFrom[current];
      console.log("reconstructing path", path.join(" -> "));
    }
    path.push(this.from);
    path.reverse();

    const end = performance.now();
    console.log(`Pathfinding took ${end - start}ms`);

    return path;
  }

  async updateMaxCost(nodes: Pathfinding, nodeId: string, costSoFar: number) {
    const distanceToTo = getDistance(
      nodes[nodeId].x ?? Infinity,
      nodes[nodeId].z ?? Infinity,
      nodes[this.to].x ?? Infinity,
      nodes[this.to].z ?? Infinity
    );
    const timeToTo = getRouteTime(distanceToTo, "walk");
    const maxCost = costSoFar + timeToTo + this.EXTRA_TIME;
    this.maxCost = Math.min(this.maxCost, maxCost);
  }

  cancel() {
    this.cancelled = true;
  }
}
