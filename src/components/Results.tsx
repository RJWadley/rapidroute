import React, { useContext, useEffect, useState } from "react";
import Search from "../routing/routingSearch";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    if (from && to) {
      const search = new Search(from, to);

      search.search().then((results) => {
        setMessage(
          results.path
            .map((node, i) =>
              i === 0
                ? `${node.from.shortName} -> ${node.to.shortName}`
                : ` -> ${node.to.shortName}`
            )
            .join("")
        );
      });
    }
  }, [from, to]);

  return <div>HERE: {message}</div>;
}
