// /* eslint-disable no-console */
// /* eslint-disable no-useless-return */
// /* eslint-disable no-await-in-loop */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { Location, Locations, Route, RouteMode } from "../data";
// import { getAll, getPath } from "../data/getData";
// import getRouteTime, { ALL_MODES } from "./getRouteTime";
// import { PathHeap, PathType } from "./routing";
// import { getDistance, sortedIndex, throttle } from "./util";

// const EXTRA_TIME = 10;

// let allLocations: Locations = {};
// /**
//  * all of the routes found so far sorted in order of time
//  */
// const pathHeap: PathType[] = [];
// /**
//  * any successful routes found in order of time
//  */
// let results: PathType[] = [];
// /**
//  * walking time between two locations
//  * used to trim routes that would be longer than just walking
//  */
// let maxRouteTime = Infinity;
// let foundSolution = false;
// let from = "";
// let to = "";
// let routeHash = "";
// let visitedLocations: { [key: string]: number } = {};
// let allowedModes: RouteMode[] = [];

// export default async function calcRoute(
//   newFrom: string,
//   newTo: string,
//   newAllowedModes?: RouteMode[]
// ) {
//   allLocations = await getAll("locations");
//   // @ts-ignore
//   window.allLocations = allLocations;

//   from = newFrom;
//   to = newTo;
//   allowedModes = newAllowedModes || [...ALL_MODES];
//   console.clear();
//   setupSearch();

//   // while searching
//   // console.log("searching");

//   // console.log("checking before loop", pathHeap[0].time, maxRouteTime);
//   while (
//     pathHeap[0] && // there is a path to search
//     pathHeap[0].time < maxRouteTime + EXTRA_TIME
//   ) {
//     // console.log("path heap length", pathHeap.length);
//     // console.log("processing next path");
//     // console.log("maxRouteTime", maxRouteTime);
//     await processNextPath();
//   }

//   console.log(
//     "done searching",
//     results.map((t) => t.path.map((l) => l.uniqueId).join(" -> ")).join("\n"),
//     results
//   );
// }

// function setupSearch() {
//   // clear previous search
//   routeHash = `${from}${to}${Math.random()}`;
//   pathHeap.length = 0;
//   // console.log("PATH HEAP CLEARED", pathHeap);
//   results.length = 0;
//   maxRouteTime = Infinity;
//   foundSolution = false;
//   visitedLocations = {};

//   // get longest possible time (aka walking time between the two locations)
//   maxRouteTime = getRouteTime(allLocations[from], allLocations[to], "walk");
//   console.log("initial maxRouteTime", maxRouteTime);

//   // get starting values
//   pathHeap.push({
//     time: 0,
//     path: [allLocations[from]],
//   });

//   // get spawn warps if applicable
//   // prevent early exit because of blank nodes
//   // sort the heap
//   // get starting path and node

//   // for debug purposes, so that we can see the search in action even after it's done
//   const dataRightNow = JSON.parse(JSON.stringify(pathHeap));
//   console.log(
//     "new heap",
//     pathHeap.map((t) => t.path.map((l) => l.uniqueId).join(" -> ")),
//     dataRightNow
//   );
// }

// async function processNextPath() {
//   await throttle();
//   const oldPath = pathHeap.shift();
//   console.log(
//     "removed path from heap",
//     oldPath?.path.map((l) => l.uniqueId).join(" -> ")
//   );
//   if (!oldPath) return;

//   const firstNode = oldPath.path[0];
//   const lastNode = oldPath.path[oldPath.path.length - 1];

//   // the local hash is used to prevent the search from continuing after a new search has started
//   const localHash = routeHash;

//   // get all routes that visit the last node
//   const allRoutesFromLastNode = await getPath(
//     "routesByLocation",
//     lastNode.uniqueId
//   );
//   // since we waited, verify the hash
//   if (localHash !== routeHash) return;

//   // we want to check all new routes concurrently and not resolve until all are done
//   // this prevents the search from running dry of new routes when it shouldn't
//   const routePromises: Promise<any>[] = [];

//   /**
//    * calculate a route to a new location with a given route,
//    * check if it's any good, and save it if so
//    *
//    * @param location the location we would head to next
//    * @param mode the mode we would use to get there
//    * @returns
//    */
//   const doTheMath = (location: string, mode: RouteMode) => {
//     if (location === "WN42") console.log("WN42");
//     // skip if new location is already in the path, because that would be going nowhere
//     if (oldPath.path.some((l) => l.uniqueId === location)) return;

//     // get travel time to the new location via the mode
//     const newPath = {
//       time: oldPath.time + getRouteTime(lastNode, allLocations[location], mode),
//       path: [...oldPath.path, allLocations[location]],
//     };
//     const firstNodeInNewPath = newPath.path[0];
//     const lastNodeInNewPath = newPath.path[newPath.path.length - 1];

//     // update maxRouteTime if we were to hypothetically walk to the end from here
//     const hypotheticalMaxRouteTime =
//       firstNodeInNewPath.uniqueId === from
//         ? newPath.time +
//           getRouteTime(lastNodeInNewPath, allLocations[to], "walk")
//         : newPath.time +
//           getRouteTime(firstNodeInNewPath, allLocations[from], "walk");
//     if (hypotheticalMaxRouteTime < maxRouteTime) {
//       maxRouteTime = hypotheticalMaxRouteTime;
//       results = results.filter((r) => r.time <= maxRouteTime + EXTRA_TIME);
//       console.log(
//         "updated walk maxRouteTime",
//         maxRouteTime,
//         " if we walked the path ",
//         newPath.path.map((l) => l.uniqueId).join(" -> "),
//         " -> ",
//         to
//       );
//     }

//     // skip if travel time is too long to be worth it
//     if (newPath.time > maxRouteTime + EXTRA_TIME) {
//       return;
//     }

//     if (newPath.time === Infinity)
//       // skip if newLegTime is Infinity
//       return;

//     // skip if this location has already been visited and the time is longer than the previous time
//     // and save this time in visitedLocations for future reference
//     if (visitedLocations[location] && visitedLocations[location] < newPath.time)
//       return;

//     visitedLocations[location] = newPath.time;

//     // determine if this path is a success
//     // i.e. path goes from start to end or vice versa
//     if (
//       (firstNodeInNewPath.uniqueId === from &&
//         lastNodeInNewPath.uniqueId === to) ||
//       (firstNodeInNewPath.uniqueId === to &&
//         lastNodeInNewPath.uniqueId === from)
//     ) {
//       foundSolution = true;
//       maxRouteTime = newPath.time;
//       console.log(
//         "solution new maxRouteTime",
//         maxRouteTime,
//         ` if we ${mode}ed the path `,
//         newPath.path.map((l) => l.uniqueId).join(" -> ")
//       );

//       // if the path starts at the to location, reverse it
//       if (firstNodeInNewPath.uniqueId === to) {
//         newPath.path.reverse();
//       }

//       // if this path matches any existing path and this path isn't shorter, don't save it as a result
//       if (
//         results.some(
//           (t) =>
//             t.path.length === newPath.path.length &&
//             t.path.every((l, i) => l.uniqueId === newPath.path[i].uniqueId) &&
//             t.time <= newPath.time
//         )
//       ) {
//         return;
//       }

//       // filter out any results that match this result (but are inherently longer or same length because of the above check)
//       results = results.filter(
//         (t) =>
//           t.path.length !== newPath.path.length ||
//           !t.path.every((l, i) => l.uniqueId === newPath.path[i].uniqueId)
//       );

//       results.push(newPath);
//       results = results.filter((r) => r.time <= maxRouteTime + EXTRA_TIME);
//       return;
//     }

//     // now that we know this path is good, add it to the heap according to its time
//     const indexToAddAt = sortedIndex(pathHeap, newPath.time);
//     pathHeap.splice(indexToAddAt, 0, newPath);

//     console.log(
//       `adding path to heap with mode ${mode}`,
//       newPath.path.map((l) => l.uniqueId).join(" -> ")
//     );

//     // for debug purposes, so that we can see the search in action even after it's done
//     const dataRightNow = JSON.parse(JSON.stringify(pathHeap));
//     console.log(
//       "new heap",
//       pathHeap.map((t) => t.path.map((l) => l.uniqueId).join(" -> ")),
//       dataRightNow
//     );
//   };

//   /**
//    * go through potential new routes and doTheMath on each
//    */
//   allRoutesFromLastNode?.routes.forEach((route) => {
//     // first get actual route information from the id
//     const prom = getPath("routes", route);
//     routePromises.push(prom);
//     prom.then((newRoute) => {
//       if (localHash !== routeHash) return; // verify the hash after awaiting

//       // visit every location on the route
//       if (newRoute?.locations)
//         Object.keys(newRoute.locations).forEach((location) =>
//           doTheMath(location, newRoute.type)
//         );
//     });
//   });

//   // walking routes gotta be handled separately
//   Object.keys(allLocations).forEach((location) => {
//     doTheMath(location, "walk");
//   });

//   await Promise.allSettled(routePromises);
// }

export {};
