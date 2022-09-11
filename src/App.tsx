import React from "react";

import Results from "components/Results";
import { RoutingProvider } from "components/RoutingContext";
import Selection from "components/Selection";

function App() {
  return (
    <RoutingProvider>
      <Selection />
      <Results />
    </RoutingProvider>
  );
}

export default App;
