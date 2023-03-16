import { startTransition, useEffect, useState } from "react"

import { City } from "types/cityList"

const citiesURL =
  "https://script.google.com/macros/s/AKfycbwde4vwt0l4_-qOFK_gL2KbVAdy7iag3BID8NWu2DQ1566kJlqyAS1Y/exec?spreadsheetId=1JSmJtYkYrEx6Am5drhSet17qwJzOKDI7tE7FxPx4YNI&sheetName=New%20World"

export default function useCities() {
  const [cities, setCities] = useState<City[]>([])

  useEffect(() => {
    let mounted = true

    fetch(citiesURL)
      .then(response => response.json())
      .then((data: City[]) => {
        // add the cities to the state 10 at a time
        if (mounted) setCities(data.slice(0, 10))
        else return
        let i = 10
        const interval = setInterval(() => {
          startTransition(() => {
            if (mounted) setCities(prev => [...prev, ...data.slice(i, i + 10)])
          })
          i += 10
          if (i >= data.length) {
            clearInterval(interval)
          }
        }, 100)
      })
      .catch(console.error)

    return () => {
      mounted = false
    }
  }, [])

  return cities
}
