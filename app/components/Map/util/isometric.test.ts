import { expect, test } from "bun:test"
import {
	convertPointFromIsometric,
	convertPointToIsometric,
	shiftWorldCoordinateToIsometric,
	shiftWorldCoordinateFromIsometric,
} from "./isometric"

test("iso converters are reversible", () => {
	for (let x = -100; x < 100; x += 10) {
		for (let y = -100; y < 100; y += 10) {
			for (let z = -100; z < 100; z += 10) {
				// iso -> flat -> iso
				{
					const isoToFlat = convertPointToIsometric({ x, y, z })
					const flatToIso = convertPointFromIsometric({ ...isoToFlat, y })

					expect(flatToIso.x).toBeCloseTo(x, 1)
					expect(flatToIso.y).toBeCloseTo(y, 1)
					expect(flatToIso.z).toBeCloseTo(z, 1)
				}

				// flat -> iso -> flat
				{
					const flatToIso = convertPointToIsometric({ x, y, z })
					const isoToFlat = convertPointFromIsometric({ ...flatToIso, y })

					expect(isoToFlat.x).toBeCloseTo(x, 1)
					expect(isoToFlat.y).toBeCloseTo(y, 1)
					expect(isoToFlat.z).toBeCloseTo(z, 1)
				}
			}
		}
	}
})

test("shifters are reversible", () => {
	for (let x = -100; x < 100; x += 10) {
		for (let y = -100; y < 100; y += 10) {
			for (let z = -100; z < 100; z += 10) {
				// iso -> flat -> iso
				{
					const isoToFlat = shiftWorldCoordinateToIsometric({ x, y, z })
					const flatToIso = shiftWorldCoordinateFromIsometric({
						...isoToFlat,
						y,
					})

					expect(flatToIso.x).toBeCloseTo(x, 1)
					expect(flatToIso.z).toBeCloseTo(z, 1)
				}

				// flat -> iso -> flat
				{
					const flatToIso = shiftWorldCoordinateToIsometric({ x, y, z })
					const isoToFlat = shiftWorldCoordinateFromIsometric({
						...flatToIso,
						y,
					})

					expect(isoToFlat.x).toBeCloseTo(x, 1)
					expect(isoToFlat.z).toBeCloseTo(z, 1)
				}
			}
		}
	}
})
