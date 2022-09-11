import React from "react";

type LocationId = string;

type SearchListProps = {
  locations: LocationId[];
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
        <div key={loc} onClick={() => setSelectedIndex(i)}>
          {i === currentlySelected && "Selected:"}
          {loc}
        </div>
      ))}
    </div>
  );
}
