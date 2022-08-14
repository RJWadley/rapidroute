import React, { useContext, useMemo } from "react";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);

  const message = useMemo(() => {
    return `DISPLAYING RESULTS FOR ${from?.name} TO ${to?.name}`;
  }, [from, to]);

  return <div>HERE:{message}</div>;
}
