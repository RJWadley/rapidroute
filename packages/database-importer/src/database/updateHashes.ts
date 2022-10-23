import database from "./database"

export default function updateHashes() {
  const newHash = Math.random().toString(36).substring(2, 15)
  return Promise.allSettled([
    database.ref("hashes/routes").set(newHash),
    database.ref("hashes/locations").set(newHash),
    database.ref("hashes/providers").set(newHash),
    database.ref("hashes/pathfinding").set(newHash),
    database.ref("hashes/searchIndex").set(newHash),
  ])
}
