import FlexSearch from "flexsearch";

import { getAll } from "./getData";

const searchWorker = new FlexSearch.Index({
  tokenize: "reverse",
  charset: "latin:simple",
});
const strictSearchWorker = new FlexSearch.Index({
  tokenize: "strict",
});

const displayLookup: Record<string, string> = {};

getAll("searchIndex").then((data) => {
  Object.keys(data).forEach((key) => {
    searchWorker.add(key, data[key].i);
    strictSearchWorker.add(key, data[key].i);
    displayLookup[key] = data[key].d;
  });
});

export function search(query: string) {
  const strictResults = strictSearchWorker.search(query, {
    suggest: true,
    limit: 200,
  });

  let results = searchWorker.search(query, {
    suggest: true,
    limit: 200,
  });

  results = [...strictResults, ...results];
  results = [...new Set(results)];

  results = results.sort((a, b) => {
    if (typeof a === "string" && typeof b === "string") {
      // prefer exact matches, ignoring case
      if (a.toLowerCase() === query.toLowerCase()) return -1;
      if (b.toLowerCase() === query.toLowerCase()) return 1;
    }
    return 0;
  });

  return results.map((x) => (typeof x === "number" ? x.toString() : x));
}

export function getTextboxName(locationId: string) {
  return displayLookup[locationId] ?? locationId;
}
