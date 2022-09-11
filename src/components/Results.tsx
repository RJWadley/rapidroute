import React, { useContext, useEffect, useState } from "react";

import styled, { keyframes } from "styled-components";

import FindPath from "../routing/findPath";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    if (from && to) {
      const findPath = new FindPath(from, to);
      setMessage("Finding path...");

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
      <Spinner />
    </div>
  );
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }         
`;

const Spinner = styled.div`
  width: 200px;
  height: 200px;
  border: 10px solid #f3f;
  animation: ${spin} 2s linear infinite;
`;
