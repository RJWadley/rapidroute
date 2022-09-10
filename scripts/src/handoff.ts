import { LegacyPlace, LegacyRoute, LegacyProvider, Aliases } from ".";
import { Route, RouteLocations } from "../../src/types/routes";
import { Location } from "../../src/types/locations";
import { Provider } from "../../src/types/providers";
import { saveDataToFirebase } from "./saveData";

/**
 * take the old data format and convert it to the new format
 */
export const handoffData = async (
  routes: LegacyRoute[],
  places: LegacyPlace[],
  providers: LegacyProvider[],
  aliases: Aliases[],
  spawnWarps: string[],
  lightColors: {
    [key: string]: string;
  },
  darkColors: {
    [key: string]: string;
  },
  logos: Record<string, string>
) => {
  const routesToIgnore: string[] = [];
  const mappedRoutes: Route[] = routes
    .map((route) => {
      // first, we need an unique id for the route that will always be the same
      let placeA = route.from > route.to ? route.to : route.from;
      let placeB = route.from > route.to ? route.from : route.to;
      let routeId = makeSafe(
        `${route.provider}-${route.number ?? placeA + placeB}`
      );

      // if we've already seen this route, ignore it the second time
      if (routesToIgnore.includes(routeId)) {
        return;
      }
      routesToIgnore.push(routeId);

      // and collect locations and gate info for the route
      let routesWithSameNumber = routes.filter(
        (y) => y.number === route.number && y.provider === route.provider
      );
      let locations: RouteLocations = {};
      routesWithSameNumber.map((y) => {
        locations[makeSafe(y.from)] = y.fromGate ?? "none";
      });

      // with a fallback for MRT stations bc they're special
      if (route.mode === "MRT") {
        locations = {
          [makeSafe(route.from)]: "none",
          [makeSafe(route.to)]: "none",
        };
      }

      const mappedRoute: Route = {
        uniqueId: routeId,
        autoGenerated: true,
        name: null,
        description: null,
        locations,
        provider: makeSafe(route.provider ?? ""),
        type: route.mode,
        number: route.number ? parseInt(route.number) || null : null,
      };
      return mappedRoute;
    })
    .flatMap((x) => (x ? [x] : []));

  const mappedLocations: Location[] = places.map((place) => {
    let location: Location = {
      uniqueId: makeSafe(place.id),
      name:
        place.displayName ??
        place.longName ??
        place.shortName ??
        "Untitled Location",
      shortName: place.shortName ?? place.id,
      description: null,
      enabled: true,
      IATA: place.type === "airport" ? place.shortName || null : null,
      location:
        place.x && place.z
          ? {
              x: place.x,
              z: place.z,
              y: null,
            }
          : null,
      MRT_TRANSIT_NAME: place.MRT_TRANSIT_NAME ?? null,
      ownerPlayer: null,
      world: place.world,
      autoGenerated: true,
      isSpawnWarp: spawnWarps.includes(place.id),
      type:
        place.type === "MRT"
          ? "MRT Station"
          : place.type === "airport"
          ? "Airport"
          : place.type === "town"
          ? "City"
          : "Other",
      routes: routes
        .filter((y) => y.from === place.id || y.to === place.id)
        .map((y) => {
          let placeA = y.from > y.to ? y.to : y.from;
          let placeB = y.from > y.to ? y.from : y.to;
          let routeId = makeSafe(
            `${y.provider}-${y.number ?? placeA + placeB}`
          );
          return routeId;
        })
        .filter((value, index, self) => self.indexOf(value) === index),
    };

    return location;
  });

  const mappedProviders: Provider[] = providers.map((provider) => {
    let newProvider: Provider = {
      uniqueId: makeSafe(provider.name),
      name: provider.name,
      alias: aliases
        .filter((x) => x.actualProvider === provider.name)
        .map((x) => ({
          displayProvider: x.displayProvider,
          numberRange: {
            start: x.start,
            end: x.end,
          },
        })),
      color: {
        light: lightColors[provider.name] ?? null,
        dark: darkColors[provider.name] ?? null,
      },
      description: null,
      logo: logos[provider.name] ?? null,
      numberPrefix: provider.prefix ?? null,
      ownerPlayer: null,
      autoGenerated: true,
    };

    return newProvider;
  });

  saveDataToFirebase(mappedRoutes, mappedLocations, mappedProviders);
};

//can't contain ".", "#", "$", "[", "]", or "/" or "\"
const makeSafe = (str: string) => {
  return str.replace(/[\.#$\/\[\]]/g, "_");
};
