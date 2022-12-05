import { database } from "./database"

/**
 * hashes are used to validate cached data,
 * so we need to update them when we update the data
 *
 * this just gives us all new hashes for everything
 */
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
