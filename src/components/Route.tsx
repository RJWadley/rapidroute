/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

interface RouteProps {
  route: string[];
  diff: string[];
}

export default function Route({ route, diff }: RouteProps) {
  return (
    <div>
      {/* <div>Via {listify(diff)}</div> */}
      <div>{route.join(" -> ")}</div>
    </div>
  );
}

/**
 * join the array of strings with commas and the last one with "and"
 */
const listify = (arr: string[]) => {
  if (arr.length === 0) {
    return "fastest route";
  }
  if (arr.length === 1) {
    return arr[0];
  }
  if (arr.length === 2) {
    return `${arr[0]} and ${arr[1]}`;
  }
  return `${arr.slice(0, -1).join(", ")}, and ${arr.slice(-1)}`;
};
