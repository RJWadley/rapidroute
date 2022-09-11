/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";

import { getPath } from "data/getData";
import describeDiff from "pathfinding/postProcessing/describeDiff";
import { Location, Route as RouteType } from "types";

import createSegments, { SegmentType } from "./createSegments";
import Segment from "./Segment";

interface RouteProps {
  route: string[];
  diff: string[];
}

export default function Route({ route, diff }: RouteProps) {
  const [locations, setLocations] = useState<(Location | null)[] | null>(null);
  const [routes, setRoutes] = useState<(RouteType | null)[][] | null>(null);
  const [segments, setSegments] = useState<SegmentType[] | null>(null);

  useMemo(() => {
    setRoutes(null);
    setLocations(null);
    setSegments(null);

    const promises = route.map((locationId) =>
      getPath("locations", locationId)
    );

    Promise.all(promises).then((results) => {
      setLocations(results);

      // for each set of locations, get the routes they have in common
      const routePromises = results.map((location, index) => {
        if (index === 0) {
          return [];
        }
        const previousLocation = results[index - 1];
        if (!previousLocation || !location) {
          return [Promise.resolve(null)];
        }

        const commonRoutes = location.routes.filter((routeId) =>
          previousLocation.routes.includes(routeId)
        );

        return commonRoutes.map((routeId) => getPath("routes", routeId));
      });

      // wait for all promises to resolve
      Promise.all(routePromises.map((p) => Promise.all(p))).then((objs) => {
        objs.shift();
        setRoutes(objs);
      });
    });
  }, [route]);

  useMemo(() => {
    if (routes && locations) {
      setSegments(createSegments(locations, routes));
    }
  }, [routes, locations]);

  return (
    <div>
      <div>Via {describeDiff(diff)}</div>
      {segments?.map((segment, index) => (
        <Segment key={segment.from.uniqueId} segment={segment} />
      ))}
    </div>
  );
}
