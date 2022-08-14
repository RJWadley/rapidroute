import React, { useMemo, useState } from "react";
import { Location } from "../data";

// create a provider
export const RoutingContext = React.createContext<{
  from: Location | null;
  to: Location | null;
  setFrom: (from: Location | null) => void;
  setTo: (to: Location | null) => void;
}>({
  from: null,
  to: null,
  setFrom: () => {},
  setTo: () => {},
});

export function RoutingProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [from, setFrom] = useState<Location | null>(null);
  const [to, setTo] = useState<Location | null>(null);

  const value = useMemo(() => {
    return {
      from,
      to,
      setFrom,
      setTo,
    };
  }, [from, to, setFrom, setTo]);

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  );
}
