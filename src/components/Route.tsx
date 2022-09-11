/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import describeDiff from "pathfinding/postProcessing/describeDiff";

interface RouteProps {
  route: string[];
  diff: string[];
}

export default function Route({ route, diff }: RouteProps) {
  return (
    <div>
      <div>Via {describeDiff(diff)}</div>
      <div>{route.join(" -> ")}</div>
    </div>
  );
}
