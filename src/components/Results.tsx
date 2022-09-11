import React, { useContext, useEffect, useState } from "react";
import FindPath from "../routing/findPath";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    if (from && to) {
      const findPath = new FindPath(from, to);

      findPath.findPath().then((results) => {
        setMessage(results.join(" -> "));
      });

      return () => {
        findPath.cancel();
      };
    }
    return undefined;
  }, [from, to]);

  return (
    <div>
      HERE:
      <div>{message}</div>
    </div>
  );
}
