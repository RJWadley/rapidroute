import { getAll } from "./getData";

const searchIndexRaw = getAll("searchIndex");

export async function search(query: string) {
  const results: string[] = [];
  const searchIndex = await searchIndexRaw;

  Object.keys(searchIndex).forEach((key) => {
    const locationText = searchIndex[key];
    if (locationText.toLowerCase().includes(query.toLowerCase())) {
      results.push(key);
    }
  });

  return results;
}

export function getTextboxName(location: string | null | undefined) {
  return location ?? "???";
}
