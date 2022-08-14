import { ref, onValue } from "firebase/database";
import {
  DatabaseType,
  Locations,
  Providers,
  Routes,
  RoutesByLocation,
  Worlds,
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
  routesByLocation: {},
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

export async function getPath(type: keyof DatabaseType, itemName: string) {
  return new Promise<DatabaseType[keyof DatabaseType][string]>((resolve) => {
    // if exists in cache and not expired, return cached value
    if (
      databaseCache[type][itemName] &&
      expiration[type][itemName] > Date.now()
    ) {
      resolve(databaseCache.routes[itemName]);
      return;
    }

    // otherwise, fetch from firebase
    const routeRef = ref(database, `${type}/${itemName}`);
    onValue(routeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        databaseCache[type][itemName] = data;
        expiration[type][itemName] = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
        localStorage.setItem("databaseCache", JSON.stringify(databaseCache));
        localStorage.setItem(
          "databaseCacheExpiration",
          JSON.stringify(expiration)
        );
        resolve(data);
      }
    });
  });
}

type TypeName = keyof DatabaseType;
type ObjectType<T> = T extends "providers"
  ? Providers
  : T extends "routes"
  ? Routes
  : T extends "locations"
  ? Locations
  : T extends "worlds"
  ? Worlds
  : T extends "routesByLocation"
  ? RoutesByLocation
  : never;

export function getAll<T extends TypeName>(type: T): Promise<ObjectType<T>> {
  return new Promise((resolve) => {
    if (databaseCache[type] && expiration.allOf[type] > Date.now()) {
      resolve(databaseCache[type] as ObjectType<T>);
      return;
    }

    const typeRef = ref(database, type);
    onValue(typeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);

        expiration.allOf[type] = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

        Object.keys(data).forEach((itemName) => {
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
