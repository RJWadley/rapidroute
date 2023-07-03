import { useQuery } from "@tanstack/react-query"
import { City } from "types/cityList"

const citiesURL =
  "https://script.google.com/macros/s/AKfycbwde4vwt0l4_-qOFK_gL2KbVAdy7iag3BID8NWu2DQ1566kJlqyAS1Y/exec?spreadsheetId=1JSmJtYkYrEx6Am5drhSet17qwJzOKDI7tE7FxPx4YNI&sheetName=New%20World"

export default function useCities() {
  const { data } = useQuery<City[]>({
    queryKey: [citiesURL],
  })

  return data ?? []
}
