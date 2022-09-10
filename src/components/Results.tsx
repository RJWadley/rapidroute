import React, { useContext, useEffect, useState } from "react";
import Search from "../routing/routingSearch";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);
  const [message, setMessage] = useState(["Loading..."]);

  useEffect(() => {
    if (from && to) {
      const search = new Search(from, to);

      search.search().then((results) => {
        setMessage(
          results.map((result) =>
            result.path.map((node) => `${node.shortName} ->`).join("")
          )
        );
      });

      return () => search.cancel();
    }
    return () => {};
  }, [from, to]);

  return (
    <div>
      HERE:
      {message.map((m) => (
        <div key={m}>{m}</div>
      ))}
    </div>
  );
}
