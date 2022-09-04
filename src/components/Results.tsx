import React, { useContext, useEffect, useMemo } from "react";
import calcRoute from "../routing/calcRoute";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);

  const message = useMemo(() => {
    if (from && to)
      return `DISPLAYING RESULTS FOR ${from?.name} TO ${to?.name}`;
    return "";
  }, [from, to]);

  useEffect(() => {
    if (from && to) calcRoute(from.uniqueId, to.uniqueId);
  }, [from, to]);

  return <div>HERE:{message}</div>;
}
