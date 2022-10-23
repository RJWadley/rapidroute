import { write } from "./database"

export default function updateHashes() {
  const newHash = Math.random().toString(36).substring(2, 15)
  return Promise.allSettled([
    write("hashes/routes", newHash),
    write("hashes/locations", newHash),
    write("hashes/providers", newHash),
    write("hashes/pathfinding", newHash),
    write("hashes/searchIndex", newHash),
    write("lastImport", new Date().toISOString()),
  ])
}
