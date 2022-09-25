import {
  isSearchIndexItem,
  SearchIndexItem,
} from "@rapidroute/database-types/dist/src/searchIndex"
import { initializeApp } from "firebase/app"
import { get, getDatabase, ref } from "firebase/database"
import FlexSearch from "flexsearch"

const firebaseConfig = {
  apiKey: "AIzaSyAk72DEr-1lB3XeRWIHKQ-yq_mTytWXxoo",
  authDomain: "rapidroute-7beef.firebaseapp.com",
  databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
  projectId: "rapidroute-7beef",
  storageBucket: "rapidroute-7beef.appspot.com",
  messagingSenderId: "967487541876",
  appId: "1:967487541876:web:f987b300677d9710e5b721",
  measurementId: "G-3SEGJSYBBW",
}

export const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

const isObject = (
  obj: unknown
): obj is Record<string | number | symbol, unknown> => {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj)
}

export const getSearchIndex = async () => {
  const snapshotRef = ref(database, "searchIndex")
  const snapshot: unknown = (await get(snapshotRef)).val()
  const out: Record<string, SearchIndexItem> = {}

  if (isObject(snapshot)) {
    Object.keys(snapshot).forEach(key => {
      const item = snapshot[key]
      if (isObject(item)) item.uniqueId = key
      if (isSearchIndexItem(item)) {
        out[key] = item
      }
    })
    return out
  }

  throw new Error("Invalid search index")
}

const searchWorker = new FlexSearch.Index({
  tokenize: "forward",
  charset: "latin:simple",
})

const index = getSearchIndex().then(data => {
  Object.values(data).forEach(item => {
    searchWorker.add(item.uniqueId, item.i)
  })
  return data
})

export async function search(query: string) {
  const localIndex = await index
  if (Object.keys(localIndex).includes(query)) return query

  const results = searchWorker.search(query, {
    suggest: true,
    limit: 1,
  })

  return results[0]
}
