import React, { useContext, useEffect, useMemo } from "react";
import Search from "../routing/search";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);

  const message = useMemo(() => {
    if (from && to)
      return `DISPLAYING RESULTS FOR ${from?.name} TO ${to?.name}`;
    return "";
  }, [from, to]);

  useEffect(() => {
    if (from && to) {
      const search = new Search(from, to);

      search.search().then((results) => {
        console.log(
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

  return <div>HERE:{message}</div>;
}
