import { Location } from "../data";
import { getAll } from "./getData";

const allLocations = getAll("locations");

export async function search(query: string) {
  const results: Location[] = [];
  const locations = await allLocations;

  Object.keys(locations).forEach((key) => {
    const location = locations[key];
    if (getTextboxName(location).toLowerCase().includes(query.toLowerCase())) {
      location.uniqueId = key;
      results.push(location);
    }
  });

  return results;
}

export function getTextboxName(location: Location | null | undefined) {
  return location ? `${location.shortName} - ${location.name}` : "";
}
