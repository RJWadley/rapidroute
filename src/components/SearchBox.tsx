import React from "react";

interface SearchBoxProps {
  searchText: (text: string) => void;
  sendKey: (key: string, boxRef: React.RefObject<HTMLInputElement>) => void;
}

export default function SearchBox({
  searchText,
  sendKey,
}: SearchBoxProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filterLocations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value ?? "";
    searchText(input);
  };

  const checkForEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sendKey(e.key, inputRef);

    // focus the next input box on the page
    // if this is the last input box on the page, focus the first input box on the page
    if (e.key === "Enter" && inputRef.current) {
      // get all siblings of the input box
      const siblings = Array.from(document.querySelectorAll("input") ?? []);

      // get the index of the input box in the siblings array
      const index = siblings.indexOf(inputRef.current);

      // if the index is the last index in the array, focus the first input box on the page
      if (index === siblings.length - 1) {
        siblings[0].focus();
      }
      // otherwise, focus the next input box on the page
      else {
        siblings[index + 1].focus();
      }
    }
  };

  return (
    <div>
      <input
        onChange={filterLocations}
        onKeyDown={checkForEnter}
        onFocus={(e) => {
          sendKey("Focus", inputRef);
          searchText(e.target.value);
        }}
        onBlur={() => sendKey("Blur", inputRef)}
        ref={inputRef}
        type="text"
        placeholder="Search"
      />
    </div>
  );
}
