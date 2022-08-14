import React from "react";
import { RoutingProvider } from "./components/Routing";
import Selection from "./components/Selection";

function App() {
  return (
    <RoutingProvider>
      <Selection />
    </RoutingProvider>
  );
}

export default App;
