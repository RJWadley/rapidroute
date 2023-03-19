import { Index } from "flexsearch-ts"

import { Member } from "types/memberList"

const memberListURL =
  "https://script.googleusercontent.com/macros/s/AKfycbwde4vwt0l4_-qOFK_gL2KbVAdy7iag3BID8NWu2DQ1566kJlqyAS1Y/exec?spreadsheetId=1Hhj_Cghfhfs8Xh5v5gt65kGc4mDW0sC5GWULKidOBW8&sheetName=Members"
const searchWorker =
  Index &&
  new Index({
    tokenize: "full",
    charset: "latin:simple",
  })

fetch(memberListURL)
  .then(response => response.json())
  .then((data: Member[]) => {
    data.forEach(member => {
      const name = member.Username.toString()
      searchWorker?.add(name, name)
    })
  })
  .catch(console.error)

export default function searchForPlayer(query: string) {
  const results = searchWorker.search(query, {
    suggest: true,
    limit: 5,
  })

  return results
}
