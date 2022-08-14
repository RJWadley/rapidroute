import React, { useContext, useState } from "react";
import { Location } from "../data";
import search from "../data/search";
import { RoutingContext } from "./Routing";
import SearchBox from "./SearchBox";
import SearchList from "./SearchList";

export default function Selection() {
  const [activeBox, setActiveBox] =
    useState<React.RefObject<HTMLInputElement> | null>(null);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [mostRecentRole, setMostRecentRole] = useState<"from" | "to">("from");
  const { from, to, setTo, setFrom } = useContext(RoutingContext);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  const runSearch = async (text: string) =>
    setFilteredLocations(await search(text));

  const processKeyPress = (
    key: string,
    box: React.RefObject<HTMLInputElement>,
    role: "from" | "to"
  ) => {
    setActiveBox(box);

    if (key === "Enter" || key === "Blur") {
      let selected: Location | null = filteredLocations[selectedLocationIndex];
      if (activeBox?.current?.value === "") selected = null;

      if (activeBox && activeBox.current) {
        activeBox.current.value = selected?.name ?? "";
      }
      setMostRecentRole(role);

      if (role === "from") {
        setFrom(selected);
      } else {
        setTo(selected);
      }
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
    // set text of active box to current search result
    if (activeBox && activeBox.current) {
      activeBox.current.value = filteredLocations[index]?.name ?? "";
    }

    if (mostRecentRole === "from") {
      setFrom(filteredLocations[index]);
    } else {
      setTo(filteredLocations[index]);
    }
  };

  return (
    <div>
      FROM: {from?.shortName} {from?.name} <br /> TO: {to?.shortName} {to?.name}
      <SearchBox
        searchText={runSearch}
        sendKey={(a, b) => processKeyPress(a, b, "from")}
      />
      <SearchBox
        searchText={runSearch}
        sendKey={(a, b) => processKeyPress(a, b, "to")}
      />
      <SearchList
        locations={filteredLocations}
        currentlySelected={selectedLocationIndex}
        setSelectedIndex={selectionClick}
      />
    </div>
  );
}
