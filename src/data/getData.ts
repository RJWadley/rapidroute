/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, onValue, get } from "firebase/database";
import { DatabaseType, Hashes } from "../types";
import { database } from "./firebase";

const rawcache = localStorage.getItem("databaseCache");
const rawOneHash = localStorage.getItem("oneHash");
const rawAllHash = localStorage.getItem("allHash");

const databaseCache: DatabaseType = rawcache
  ? JSON.parse(rawcache)
  : {
      locations: {},
      pathfinding: {},
      providers: {},
      routes: {},
      searchIndex: {},
      worlds: {},
    };
const oneHashes: Hashes = rawOneHash ? JSON.parse(rawOneHash) : {};
const allHashes: Hashes = rawAllHash ? JSON.parse(rawAllHash) : {};

type GetAll<T extends keyof DatabaseType> = DatabaseType[T];

type GetOne<T extends keyof DatabaseType> = DatabaseType[T][string];

export async function getPath<T extends keyof DatabaseType>(
  type: T,
  itemName: string
): Promise<GetOne<T> | null> {
  // first get the hash from the database
  const hashRef = ref(database, `hashes/${type}`);
  const snapshot = await get(hashRef);
  const hash = snapshot.val();

  // if the hash matches the one we have, return the cached value
  if (hash === oneHashes[type] && databaseCache[type][itemName]) {
    return databaseCache[type][itemName] as GetOne<T>;
  }

  // otherwise, get the value from the database
  const itemRef = ref(database, `${type}/${itemName}`);
  return new Promise((resolve) => {
    onValue(itemRef, (lowerSnapshot) => {
      if (!lowerSnapshot.exists()) return resolve(null);
      const data: GetOne<T> = lowerSnapshot.val();
      databaseCache[type][itemName] = data;
      oneHashes[type] = hash;
      localStorage.setItem("databaseCache", JSON.stringify(databaseCache));
      localStorage.setItem("oneHash", JSON.stringify(oneHashes));
      return resolve(data);
    });
  });
}

export async function getAll<T extends keyof DatabaseType>(
  type: T
): Promise<GetAll<T>> {
  // first get the hash from the database
  const hashRef = ref(database, `hashes/${type}`);
  const snapshot = await get(hashRef);
  const currentHash = snapshot.val();

  // if the hash matches the one we have, return the cached value
  if (currentHash === allHashes[type] && databaseCache[type]) {
    return databaseCache[type] as GetAll<T>;
  }

  // otherwise, get the value from the database
  const itemRef = ref(database, type);
  return new Promise((resolve) => {
    onValue(itemRef, (lowerSnapshot) => {
      const data: GetAll<T> = lowerSnapshot.val();
      databaseCache[type] = data;
      allHashes[type] = currentHash;
      oneHashes[type] = currentHash;
      localStorage.setItem("databaseCache", JSON.stringify(databaseCache));
      localStorage.setItem("allHash", JSON.stringify(allHashes));
      localStorage.setItem("oneHash", JSON.stringify(oneHashes));
      return resolve(data);
    });
  });
}
