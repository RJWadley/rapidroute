import { Index } from "flexsearch-ts"

import players from "./players"

const searchWorker =
  Index &&
  new Index({
    tokenize: "full",
    charset: "latin:simple",
  })

players.split("\n").forEach(player => {
  searchWorker.add(player, player)
})

export default function searchForPlayer(query: string) {
  const results = searchWorker.search(query, {
    suggest: true,
    limit: 5,
  })

  return results
}
