import { Location } from "../data";
import { getAll } from "./getData";

const allLocations = getAll("locations");

export default async function search(query: string) {
  const results: Location[] = [];
  const locations = await allLocations;

  Object.keys(locations).forEach((key) => {
    const location = locations[key];
    if (location.name.toLowerCase().includes(query.toLowerCase())) {
      location.uniqueId = key;
      results.push(location);
    }
  });

  return results;
}
