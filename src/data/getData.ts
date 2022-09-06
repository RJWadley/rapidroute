import { ref, onValue } from "firebase/database";
import {
  DatabaseType,
  Locations,
  Location,
  Providers,
  Routes,
  Route,
  Worlds,
  Provider,
  World,
} from "../data";
import { database } from "./firebase";

const rawCache = localStorage.getItem("databaseCache");
const expirationCache = localStorage.getItem("databaseCacheExpiration");

interface CacheType extends DatabaseType {}

let databaseCache: CacheType = {
  locations: {},
  providers: {},
  routes: {},
  worlds: {},
};
if (rawCache) {
  databaseCache = JSON.parse(rawCache);
}

const expirationTemplate = {
  allOf: {},
  locations: {},
  providers: {},
  routes: {},
  worlds: {},
  calculatedRoutes: {},
  routesByLocation: {},
};
const expiration: {
  [Property in keyof typeof expirationTemplate]: Record<string, number>;
} = expirationCache ? JSON.parse(expirationCache) : expirationTemplate;
type DatabaseKeys = keyof DatabaseType;

type GetAll<T> = T extends "providers"
  ? Providers
  : T extends "routes"
  ? Routes
  : T extends "locations"
  ? Locations
  : T extends "worlds"
  ? Worlds
  : never;

type GetOne<T> = T extends "providers"
  ? Provider
  : T extends "routes"
  ? Route
  : T extends "locations"
  ? Location
  : T extends "worlds"
  ? World
  : never;

export async function getPath<T extends DatabaseKeys>(
  type: T,
  itemName: string
): Promise<GetOne<T> | null> {
  return new Promise((resolve) => {
    // if exists in cache and not expired, return cached value
    if (
      databaseCache[type]?.[itemName] !== undefined &&
      expiration[type][itemName] > Date.now()
    ) {
      // console.log("returning cached value for", type, itemName);
      resolve(databaseCache[type][itemName] as GetOne<T>);
      return;
    }
    // console.log("no cached value for", type, itemName);

    // otherwise, fetch from firebase
    const routeRef = ref(database, `${type}/${itemName}`);
    onValue(routeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) data.uniqueId = itemName;

      databaseCache[type][itemName] = data;
      expiration[type as keyof DatabaseType][itemName] =
        Date.now() + 1000 * 60 * 60 * 24; // 24 hours
      localStorage.setItem("databaseCache", JSON.stringify(databaseCache));
      localStorage.setItem(
        "databaseCacheExpiration",
        JSON.stringify(expiration)
      );

      resolve(data ?? null);
    });
  });
}

export function getAll<T extends DatabaseKeys>(type: T): Promise<GetAll<T>> {
  return new Promise((resolve) => {
    if (databaseCache[type] && expiration.allOf[type] > Date.now()) {
      resolve(databaseCache[type] as GetAll<T>);
      return;
    }

    const typeRef = ref(database, type);
    onValue(typeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);

        expiration.allOf[type] = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

        Object.keys(data).forEach((itemName) => {
          data[itemName].uniqueId = itemName;
          databaseCache[type][itemName] = data[itemName];
          expiration[type as keyof DatabaseType][itemName] =
            Date.now() + 1000 * 60 * 60 * 24; // 24 hours});
        });

        localStorage.setItem("databaseCache", JSON.stringify(databaseCache));
        localStorage.setItem(
          "databaseCacheExpiration",
          JSON.stringify(expiration)
        );
      }
    });
  });
}
