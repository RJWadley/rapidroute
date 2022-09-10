/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Location, Route } from "../types";
import { getAll, getPath } from "../data/getData";
import getRouteTime from "./getRouteTime";
import PriorityQueue from "./PriorityQueue";
import { throttle } from "./util";

const allLocations = getAll("locations");

interface Edge {
  from: Location;
  to: Location;
  cost: number;
}

interface Result {
  path: Location[];
  totalCost: number;
}

async function getEdges(fromLocation: Location): Promise<Edge[]> {
  const rawRoutes = fromLocation.routes
    ? await Promise.all(
        fromLocation.routes.map(async (routeId) => getPath("routes", routeId))
      )
    : [];

  // filter out null
  const routes = rawRoutes.flatMap((f) => (f ? [f] : []));

  // generate routes from location to each of routes locations
  const locations = await allLocations;
  const edges: Edge[] = routes.flatMap((route) => {
    return Object.keys(route.locations).flatMap((to) => {
      if (to === fromLocation.uniqueId) {
        return [];
      }
      return locations[to]
        ? {
            from: fromLocation,
            to: locations[to],
            cost: getRouteTime(fromLocation, locations[to], route.type),
          }
        : [];
    });
  });

  const walkingEdges: Edge[] = Object.keys(locations)
    .map((key) => {
      if (key === fromLocation.uniqueId) {
        return null;
      }
      const loc = locations[key];
      return {
        from: fromLocation,
        to: loc,
        cost: getRouteTime(fromLocation, loc, "walk"),
      };
    })
    .flatMap((f) => (f ? [f] : []));

  return [...edges, ...walkingEdges];
}

export default class Search {
  start: Location;

  end: Location;

  maxCost = Infinity;

  EXTRA_COST = 100;

  constructor(start: Location, end: Location) {
    this.start = start;
    this.end = end;
  }

  heuristic(edge: Edge, costSoFar: number): number {
    const costAfter = costSoFar + edge.cost;
    const walkTimeToEnd = getRouteTime(edge.to, this.end, "walk");
    const totalCost = costAfter + walkTimeToEnd;
    this.maxCost = Math.min(this.maxCost, totalCost);

    if (totalCost !== Infinity && totalCost > this.maxCost + this.EXTRA_COST) {
      return Infinity;
    }

    return 0;
  }

  async search(): Promise<Result[]> {
    const frontier = new PriorityQueue<Location>();
    const cameFrom: Record<string, Location[]> = {};
    const costSoFar: Record<string, number> = {};

    frontier.enqueue(this.start, 0);
    costSoFar[this.start.uniqueId] = 0;

    while (!frontier.isEmpty()) {
      await throttle();
      const currentLocation = frontier.dequeue();
      if (!currentLocation || currentLocation.uniqueId === this.end.uniqueId) {
        break;
      }
      console.log("checking routes from", currentLocation.name);

      const edges = await getEdges(currentLocation);
      for (const nextEdge of edges) {
        const newCost = costSoFar[currentLocation.uniqueId] + nextEdge.cost;
        if (
          !costSoFar[nextEdge.to.uniqueId] ||
          newCost < costSoFar[nextEdge.to.uniqueId]
        ) {
          costSoFar[nextEdge.to.uniqueId] = newCost;
          const priority = newCost + this.heuristic(nextEdge, newCost);
          frontier.enqueue(nextEdge.to, priority);
          cameFrom[nextEdge.to.uniqueId] = [
            ...(cameFrom[currentLocation.uniqueId] || []),
            currentLocation,
          ];
        } else if (
          newCost === costSoFar[nextEdge.to.uniqueId] &&
          !cameFrom[nextEdge.to.uniqueId].some(
            (loc) => loc.uniqueId === currentLocation.uniqueId
          )
        ) {
          cameFrom[nextEdge.to.uniqueId].push(currentLocation);
        }
      }
    }

    const allPaths: Location[][] = [cameFrom[this.end.uniqueId]];
    const output: Result[] = [];

    while (allPaths.length > 0) {
      console.log(allPaths.map((p) => p.map((e) => `${e.shortName} -> `)));
      const currentPath = allPaths.pop();
      if (!currentPath) {
        break;
      }
      const lastEdge = currentPath[currentPath.length - 1];
      if (lastEdge.uniqueId === this.start.uniqueId) {
        output.push({
          path: currentPath.reverse(),
          totalCost: costSoFar[this.end.uniqueId],
        });
      } else if (lastEdge.uniqueId in cameFrom) {
        for (const edge of cameFrom[lastEdge.uniqueId]) {
          if (allPaths.length < 10) allPaths.push([...currentPath, edge]);
        }
      }
    }

    console.log("done", cameFrom);
    return output;
  }

  cancel() {
    this.maxCost = 0;
  }
}
