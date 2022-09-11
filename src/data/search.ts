import { getAll } from "./getData";

const searchIndexRaw = getAll("searchIndex");

export async function search(query: string) {
  const results: string[] = [];
  const searchIndex = await searchIndexRaw;

  Object.keys(searchIndex).forEach((key) => {
    const location = searchIndex[key];
    if (location.i.toLowerCase().includes(query.toLowerCase())) {
      results.push(key);
    }
  });

  return results;
}

export async function getTextboxName(locationId: string) {
  const searchIndex = await searchIndexRaw;
  return searchIndex[locationId]?.d;
}
