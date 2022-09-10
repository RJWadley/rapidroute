import React, { useContext, useEffect, useState } from "react";
import Search from "../routing/pathfind";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    if (from && to) {
      const search = new Search(from, to);

      search.search().then((results) => {
        setMessage(
          `${results.path[0].f}->${results.path.map((r) => r.t).join("->")}`
        );
      });
    }
    return () => {};
  }, [from, to]);

  return (
    <div>
      HERE:
      <div>{message}</div>
    </div>
  );
}
