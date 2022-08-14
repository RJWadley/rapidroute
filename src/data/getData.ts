import { ref, onValue } from "firebase/database";
import { Database, Locations, Providers, Routes, Worlds } from "../data";
import { database } from "./firebase";

const rawCache = localStorage.getItem("databaseCache");
const expirationCache = localStorage.getItem("databaseCacheExpiration");

const databaseCache: Database = rawCache
  ? JSON.parse(rawCache)
  : {
      locations: {},
      providers: {},
      routes: {},
      worlds: {},
    };
const expiration: Record<string, number> = expirationCache
  ? JSON.parse(expirationCache)
  : {};

export async function getPath(type: keyof Database, itemName: string) {
  return new Promise<Database[keyof Database][string]>((resolve) => {
    // if exists in cache and not expired, return cached value
    if (
      databaseCache[type][itemName] &&
      expiration[type + itemName] > Date.now()
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
        expiration[type + itemName] = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
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

type TypeName = keyof Database;
type ObjectType<T> = T extends "providers"
  ? Providers
  : T extends "routes"
  ? Routes
  : T extends "locations"
  ? Locations
  : T extends "worlds"
  ? Worlds
  : never;

export function getAll<T extends TypeName>(type: T): Promise<ObjectType<T>> {
  return new Promise((resolve) => {
    if (databaseCache[type] && expiration[type] > Date.now()) {
      resolve(databaseCache[type] as ObjectType<T>);
      return;
    }

    const typeRef = ref(database, type);
    onValue(typeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);

        expiration[type] = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

        Object.keys(data).forEach((itemName) => {
          databaseCache[type][itemName] = data[itemName];
          expiration[type + itemName] = Date.now() + 1000 * 60 * 60 * 24; // 24 hours});
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
