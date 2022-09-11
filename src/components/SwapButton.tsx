import React, { useContext } from "react";

import { RoutingContext } from "./Routing";

export default function SwapButton() {
  const { from, to, setFrom, setTo } = useContext(RoutingContext);

  const handleClick = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <button type="button" onClick={handleClick}>
      SWAP
    </button>
  );
}
