import useCities from "data/useCities"
import DelayRender from "utils/DelayRender"

import CityMarker from "./CityMarker"

export default function AllCities() {
  const cities = useCities()

  return (
    <>
      {cities.map((city, i) => (
        <DelayRender key={JSON.stringify(city)} time={Math.floor(i / 10) * 10}>
          <CityMarker
            name={city["Town Name"].toString()}
            x={city.X}
            z={city.Z}
            type={city["Town Rank"]}
            key={JSON.stringify(city)}
          />
        </DelayRender>
      ))}
      <CityMarker name="Central City" x={0} z={0} type="spawn" />
    </>
  )
}
