import { database } from "./database"

export default function updateHashes() {
  const newHash = Math.random().toString(36).substring(2, 15)
  const newHashes = {
    routes: newHash,
    locations: newHash,
    providers: newHash,
    pathfinding: newHash,
    searchIndex: newHash,
  }
  database.hashes = newHashes
  database.lastImport = new Date().toISOString()
}
