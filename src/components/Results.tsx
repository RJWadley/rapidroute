import React, { useContext, useEffect, useState } from "react";

import styled, { keyframes } from "styled-components";

import FindPath from "../routing/findPath";
import { RoutingContext } from "./Routing";

export default function Results() {
  const { from, to } = useContext(RoutingContext);
  const [results, setResults] = useState<string[][] | null>(null);

  useEffect(() => {
    if (from && to) {
      const findPath = new FindPath(from, to);
      setResults(null);

      findPath.start().then(setResults);

      return () => {
        findPath.cancel();
      };
    }
    return undefined;
  }, [from, to]);

  return (
    <div>
      HERE:
      <div>
        {results &&
          results.map((result) => (
            <div key={result.toString()}>{result.join(" -> ")}</div>
          ))}
      </div>
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
