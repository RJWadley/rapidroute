import useCities from "data/useCities"

import CityMarker from "./CityMarker"

export default function AllCities() {
  const cities = useCities()

  return (
    <>
      {cities.map(city => (
        <CityMarker
          name={city["Town Name"].toString()}
          x={city.X}
          z={city.Z}
          type={city["Town Rank"]}
          key={JSON.stringify(city)}
        />
      ))}
      <CityMarker name="Central City" x={0} z={0} type="spawn" />
    </>
  )
}
