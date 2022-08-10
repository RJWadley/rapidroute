import { Database, Route } from "../data";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";

const rawCache = localStorage.getItem("databaseCache");
const expirationCache = localStorage.getItem("databaseCacheExpiration");

const databaseCache: Database = rawCache ? JSON.parse(rawCache) : {};
const expiration: Record<string, number> = expirationCache
  ? JSON.parse(expirationCache)
  : {};

export async function getPath(type: keyof Database, itemName: string) {
  return new Promise<Database[keyof Database][string]>((resolve, reject) => {
    // if exists in cache and not expired, return cached value
    if (
      databaseCache[type][itemName] &&
      expiration[type + itemName] > Date.now()
    ) {
      return resolve(databaseCache.routes[itemName]);
    }

    // otherwise, fetch from firebase
    let routeRef = ref(database, `${type}/${itemName}`);
    onValue(routeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        databaseCache[type][itemName] = data;
        expiration[type + itemName] = Date.now() + 1000 * 60 * 60 * 48; // 48 hours
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

export async function getAll(type: keyof Database) {
  return new Promise<Database[keyof Database]>((resolve, reject) => {
    if (databaseCache[type] && expiration[type] > Date.now()) {
      return resolve(databaseCache[type]);
    }

    const typeRef = ref(database, type);
    onValue(typeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);

        expiration[type] = Date.now() + 1000 * 60 * 60 * 48; // 48 hours

        // cache data
        for (const itemName in data) {
          databaseCache[type][itemName] = data[itemName];
          expiration[type + itemName] = Date.now() + 1000 * 60 * 60 * 48; // 48 hours
        }
        localStorage.setItem("databaseCache", JSON.stringify(databaseCache));
        localStorage.setItem(
          "databaseCacheExpiration",
          JSON.stringify(expiration)
        );
      }
    });
  });
}
