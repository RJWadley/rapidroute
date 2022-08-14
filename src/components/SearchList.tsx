import React from "react";
import { Location } from "../data";

type SearchListProps = {
  locations: Location[];
  currentlySelected: number;
  setSelectedIndex: (index: number) => void;
};

export default function SearchList({
  locations,
  currentlySelected,
  setSelectedIndex,
}: SearchListProps): JSX.Element {
  return (
    <div>
      {locations.map((loc, i) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <span key={loc.uniqueId} onClick={() => setSelectedIndex(i)}>
          {i === currentlySelected && "Selected:"}
          {loc.name}
        </span>
      ))}
    </div>
  );
}
