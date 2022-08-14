import React, { useContext, useState } from "react";
import { Location } from "../data";
import { search } from "../data/search";
import { RoutingContext } from "./Routing";
import SearchBox from "./SearchBox";
import SearchList from "./SearchList";
import SwapButton from "./SwapButton";

export default function Selection() {
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [mostRecentRole, setMostRecentRole] = useState<"from" | "to">("from");
  const { from, to, setTo, setFrom } = useContext(RoutingContext);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  const runSearch = async (text: string) => {
    setSelectedLocationIndex(0);
    return setFilteredLocations(await search(text));
  };

  const processKeyPress = (
    key: string,
    box: React.RefObject<HTMLInputElement>,
    role: "from" | "to"
  ) => {
    runSearch(box.current?.value ?? "");
    setMostRecentRole(role);

    if (key === "Enter" || key === "Blur") {
      let selected: Location | null = filteredLocations[selectedLocationIndex];
      if (box?.current?.value === "") selected = null;

      updateSelected(selected);
    }

    if (key === "ArrowDown") {
      if (selectedLocationIndex < Object.keys(filteredLocations).length - 1) {
        setSelectedLocationIndex(selectedLocationIndex + 1);
      }
    }

    if (key === "ArrowUp") {
      if (selectedLocationIndex > 0) {
        setSelectedLocationIndex(selectedLocationIndex - 1);
      }
    }
  };

  const selectionClick = (index: number) => {
    setSelectedLocationIndex(index);
    updateSelected(filteredLocations[index]);
  };

  const updateSelected = (newSelection: Location | null) => {
    if (mostRecentRole === "from") {
      setFrom(newSelection);
    } else {
      setTo(newSelection);
    }
  };

  return (
    <div>
      <SwapButton />
      FROM: {from?.shortName} {from?.name} <br /> TO: {to?.shortName} {to?.name}
      <SearchBox
        searchText={runSearch}
        sendKey={(a, b) => processKeyPress(a, b, "from")}
        searchRole="from"
      />
      <SearchBox
        searchText={runSearch}
        sendKey={(a, b) => processKeyPress(a, b, "to")}
        searchRole="to"
      />
      <SearchList
        locations={filteredLocations}
        currentlySelected={selectedLocationIndex}
        setSelectedIndex={selectionClick}
      />
    </div>
  );
}
