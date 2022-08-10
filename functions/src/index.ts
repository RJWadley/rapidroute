const DATA_SHEET_ID = "13t7mHiW9HZjbx9eFP2uTAO5tLyAelt5_iITqym2Ejn8"; // 3 calls
const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps"; //1 call
const TOWN_SHEET_ID = "1JSmJtYkYrEx6Am5drhSet17qwJzOKDI7tE7FxPx4YNI"; // 1 call
const API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8"; //1 call

const VERSION = 20211030;

//fetch for node.js
import fetch from "node-fetch";
import { Location, Provider, Route } from "./data";

const getItem = (item: string) => {
  return null;
};
const setItem = (item: string, value: any) => {
  return null;
};

function transpose(a: Array<any>) {
  // Calculate the width and height of the Array
  var w = a.length || 0;

  //calculate the max height of array
  let maxHeight = 0;
  a.forEach((item) => {
    if (item.length > maxHeight) {
      maxHeight = item.length;
    }
  });

  var h = maxHeight;

  // In case it is a zero matrix, no transpose routine needed.
  if (h === 0 || w === 0) {
    return [];
  }

  /**
   * @var {Number} i Counter
   * @var {Number} j Counter
   * @var {Array} t Transposed data is stored in this array.
   */
  var i: number,
    j: number,
    t: Array<any> = [];

  // Loop through every item in the outer array (height)
  for (i = 0; i < h; i++) {
    // Insert a new row (array)
    t[i] = [];

    // Loop through every item per item in outer array (width)
    for (j = 0; j < w; j++) {
      // Save transposed data.
      t[i][j] = a[j][i];
    }
  }

  return t;
}

setItem("version", VERSION);

//globals
let logos: {
  [key: string]: string;
} = {};
let lightColors: {
  [key: string]: string;
} = getItem("lightColors") || {};
let darkColors: {
  [key: string]: string;
} = getItem("darkColors") || {};

let ignoredPlaces: Array<string> = [];

let routes: Array<LegacyRoute> = getItem("routes") || [];
let places: Array<LegacyPlace> = getItem("places") || [];
let providers: Array<LegacyProvider> = getItem("providers") || [];
let codeshares: {
  [key: string]: {
    [key: string]: string;
  };
} = getItem("codeshares") || {};
let spawnWarps: Array<string> = getItem("spawnWarps") || [
  "C1",
  "C33",
  "C61",
  "C89",
];

type Mode = "flight" | "seaplane" | "heli" | "MRT" | "walk" | "spawnWarp";
type PlaceType = "MRT" | "airport" | "town";
type World = "New" | "Old";

interface LegacyRoute {
  from: string;
  to: string;
  mode: Mode;
  provider?: string;
  number?: string;
  displayBy?: string;
  fromGate?: string;
  toGate?: string;
}

interface LegacyPlace {
  id: string;
  world: World;
  type: PlaceType;
  shortName?: string;
  longName?: string;
  displayName?: string;
  x?: number;
  z?: number;
  keywords?: string;
  MRT_TRANSIT_NAME?: string;
}

interface LegacyProvider {
  name: string;
  displayName?: string;
  prefix?: string;
}

async function getTransitSheet() {
  return new Promise((resolve) => {
    fetch(
      "https://sheets.googleapis.com/v4/spreadsheets/" +
        DATA_SHEET_ID +
        "/values:batchGet?" +
        "ranges='MRT Transit'!B3:B5" + //row info
        "&ranges='MRT Transit'!F3:F5" + //column info
        "&ranges='MRT Transit'!A13:A100" + //airports to ignore
        "&key=" +
        API_KEY
    )
      .then((res) => {
        return res.json();
      })
      .then((result: any) => {
        let rows = result.valueRanges[0].values;
        let cols = result.valueRanges[1].values;
        ignoredPlaces = result.valueRanges[2].values;
        ignoredPlaces.forEach((place, i) => {
          ignoredPlaces[i] = place[0];
        });
        //now get transit sheet
        fetch(
          "https://sheets.googleapis.com/v4/spreadsheets/" +
            TRANSIT_SHEET_ID +
            "/values:batchGet?" +
            //rows[0] is the last row and cols[0] is last column
            `ranges='Airline Class Distribution'!A3:C${rows[0][0]}` + //airports
            `&ranges='Airline Class Distribution'!E2:${cols[0][0]}2` + //company names
            `&ranges='Airline Class Distribution'!E3:${cols[0][0]}${rows[0][0]}` + //actual flight numbers
            //same scheme here
            `&ranges='Helicopters'!A2:C${rows[2][0]}` + //heliports
            `&ranges='Helicopters'!E1:${cols[2][0]}1` + //companynames
            `&ranges='Helicopters'!E2:${cols[2][0]}${rows[2][0]}` + //actual flight numbers
            //and seaplanes
            `&ranges='Seaplane Class Distribution'!A3:C${rows[1][0]}` + //heliports
            `&ranges='Seaplane Class Distribution'!D2:${cols[1][0]}2` + //companynames
            `&ranges='Seaplane Class Distribution'!D3:${cols[1][0]}${rows[1][0]}` + //actual flight numbers
            "&key=" +
            API_KEY
        )
          .then((res) => {
            return res.json();
          })
          .then((result) => {
            resolve(result);
          });
      });
  });
}

async function getDataSheet() {
  return new Promise((resolve) => {
    fetch(
      "https://sheets.googleapis.com/v4/spreadsheets/" +
        DATA_SHEET_ID +
        "/values:batchGet?" +
        "ranges='MRT'!B2:H19" + //mrt info
        "&ranges='Airports'!A3:F500" +
        "&ranges='Companies'!A2:F200" +
        "&ranges='CodeSharing'!A3:F200" +
        "&key=" +
        API_KEY
    )
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        resolve(result);
      });
  });
}

function getTowns() {
  return new Promise((resolve) => {
    fetch(
      "https://sheets.googleapis.com/v4/spreadsheets/" +
        TOWN_SHEET_ID +
        "/values:batchGet?" +
        "ranges='New World'!A2:G1000" +
        "&key=" +
        API_KEY
    )
      .then((res) => {
        return res.json();
      })
      .then((result: any) => {
        let towns = result.valueRanges[0].values as Array<string>;
        towns.forEach((town) => {
          let placeObject: LegacyPlace = {
            id: town[0],
            world: "New",
            type: "town",
            shortName: town[1] + " City",
            longName: town[0],
            x: parseInt(town[4]),
            z: parseInt(town[6]),
            keywords: town[1] + " " + town[2] + " " + town[3],
          };
          places.push(placeObject);
          if (town[1] == "Premier") {
            spawnWarps.push(town[0]);
          }
        });
        places.push({
          id: "Spawn",
          world: "New",
          type: "town",
          shortName: "Spawn",
          longName: "Central City",
          x: 1,
          z: 1,
        });
        spawnWarps.push("Spawn");
        resolve(result);
      });
  });
}

function parseRawFlightData(
  mode: Mode,
  placesRaw: Array<Array<string>>,
  providersRaw: Array<string>,
  routesRaw: Array<Array<string>>
) {
  //first parse the places
  let placeList: Array<LegacyPlace> = [];
  placesRaw.forEach((place) => {
    let world = <World>place[2]; //default to new
    if (world != "Old" && world != "New") {
      world = "New";
    }

    placeList.push({
      id: place[1] || place[0],
      world: world,
      shortName: place[1],
      longName: place[0],
      type: "airport",
      MRT_TRANSIT_NAME: place[1],
    });
  });

  places.push(...placeList); //add to global

  routesRaw = transpose(routesRaw); //routeData needs to be transposed

  let airlines: Array<LegacyProvider> = [];
  let flights: Array<LegacyRoute> = [];

  //for each airline
  providersRaw.forEach((airline, i) => {
    airlines.push({ name: airline });
    let flightsByNumber: {
      [key: string]: Array<LegacyPlace>;
    } = {};

    routesRaw[i]?.forEach((cell, j) => {
      //for each cell
      if (cell == "" || cell == undefined) return; //skip if empty
      cell.split(",").forEach((flight) => {
        //for each flight number in cell

        // add to flightsByNumber
        flight = flight.trim();
        if (flightsByNumber[flight] == undefined) {
          flightsByNumber[flight] = [];
        }
        flightsByNumber[flight].push(placeList[j]);
      });
    });

    Object.keys(flightsByNumber).forEach((flightNumber) => {
      flightsByNumber[flightNumber].forEach((destinationA) => {
        flightsByNumber[flightNumber].forEach((destinationB) => {
          if (destinationA == destinationB) return;
          flights.push({
            from: destinationA.id,
            to: destinationB.id,
            mode: mode,
            provider: airline,
            number: flightNumber,
          });
        });
      });
    });
  });

  routes.push(...flights);
  providers.push(...airlines);
}

function parseCodeshares(codesharesRaw: Array<Array<string>>) {
  codesharesRaw.forEach((company, i) => {
    let range = company[1]?.split("-") || []; //range.split
    if (range.length < 2) return;

    lightColors[company[2]] = company[4]; //colors[displayName] = color
    darkColors[company[2]] = company[5]; //colors[displayName] = color
    logos[company[2]] = company[3]; //logos[displayName] = logo

    if (codeshares[company[0]] == undefined) codeshares[company[0]] = {};

    for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++) {
      //name + number = displayname
      codeshares[company[0]][i] = company[2]; //
    }
  });
}

function processAirportMetadata(rawAirportData: Array<Array<string>>) {
  rawAirportData.forEach((rawAirport) => {
    let coords = rawAirport[5] ? parseCoordinates(rawAirport[5]) : undefined;

    let id = rawAirport[1] ?? rawAirport[0];
    if (id == "") id = rawAirport[0];

    let world = rawAirport[2] as World;
    if (world != "New" && world != "Old") world = "New";

    let newPlace: LegacyPlace = {
      id,
      world,
      type: "airport",
    };

    let shortName = rawAirport[1];
    if (shortName != "" && shortName != undefined)
      newPlace.shortName = shortName;

    let longName = rawAirport[0];
    if (longName != "" && longName != undefined) newPlace.longName = longName;

    let displayName = rawAirport[3];
    if (displayName != "" && displayName != undefined)
      newPlace.displayName = displayName;

    let keywords = rawAirport[4];
    if (keywords != "" && keywords != undefined) newPlace.keywords = keywords;

    if (coords != undefined) {
      newPlace.x = coords[0];
      newPlace.z = coords[1];
    }

    places.push(newPlace);
  });
}

function parseCoordinates(coords: string) {
  let split = coords.split(" ");
  let out: Array<number> = [];
  split.forEach((item, i) => {
    out[i] = parseInt(item.replace(/,/g, ""));
  });

  if (out.length == 3) {
    out[1] = out[2];
    out.pop();
  }

  if (out.length != 2) {
    split = coords.split(",");
    out = [];
    split.forEach((item, i) => {
      out[i] = parseInt(item.trim());
    });
  }

  if (out.length == 3) {
    out[1] = out[2];
    out.pop();
  }

  return out;
}

function processAirlineMetadata(rawAirlineData: Array<Array<string>>) {
  return new Promise((resolve) => {
    //set legacy gate numbers and
    //request new gate numbers
    let requestURL =
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      DATA_SHEET_ID +
      "/values:batchGet?ranges='Legacy Gate Data'!A:D";

    rawAirlineData.forEach((company) => {
      if (company[3]) logos[company[0]] = company[3];
      if (company[4]) lightColors[company[0]] = company[4];
      if (company[5]) darkColors[company[0]] = company[5];

      if (company.length > 1) {
        if (company[1] == "Yes") {
          requestURL += "&ranges='" + company[0] + "'!A:D";
        }
      }
    });

    fetch(requestURL + "&key=" + API_KEY)
      .then((response) => response.json())
      .then((result) => {
        parseAirlineGateData(result, rawAirlineData, resolve);
      });
  });
}

function parseAirlineGateData(
  result: any,
  companies: Array<Array<string>>,
  resolve: Function
) {
  let gateData: Array<Array<string>> = [];

  let sheets = result.valueRanges;

  let legacySheet = sheets.shift().values as Array<Array<string>>;
  legacySheet.shift();

  //process legacy gates
  companies.forEach((company) => {
    if (company.length > 1) {
      if (company[1] == "Legacy") {
        let flights = legacySheet.filter((x) => x[0] == company[2]);
        flights.forEach((item) => {
          item[0] = company[0];
        });
        gateData = [...gateData, ...flights];
      }
    }
  });

  //process other gates
  sheets.forEach((sheet: any) => {
    let companyName: string = "";
    if (sheet.range.indexOf("'") == -1) {
      companyName = sheet.range.split("!")[0];
    } else {
      companyName = sheet.range.split("'")[1];
    }

    let flights = sheet.values as Array<Array<string>>;
    flights.forEach((flight) => {
      flight[0] = companyName;
    });

    gateData = [...gateData, ...flights];
  });

  //now add gate info to routes
  routes.forEach((route, i) => {
    if (route.mode == "MRT") return;

    let fromGate = gateData.filter(
      (x) =>
        x[0] == route.provider && x[1] == route.number && x[2] == route.from
    )[0]?.[3];
    let toGate = gateData.filter(
      (x) => x[0] == route.provider && x[1] == route.number && x[2] == route.to
    )[0]?.[3];

    if (fromGate) {
      routes[i].fromGate = fromGate;
    }
    if (toGate) {
      routes[i].toGate = toGate;
    }
  });

  resolve(true);
}

function generateMrt(
  rawMRTInfo: Array<Array<string>>,
  rawStopInfo: Array<Array<string>>
) {
  let routeList: Array<LegacyRoute> = [];
  let placeList: Array<LegacyPlace> = [];

  //generate list of MRT stop routes
  rawMRTInfo.forEach((item, i) => {
    let minSE = 2;
    let maxNW = 3;
    let nsew = 4;
    let lineCode = item[1];
    let lineName = item[0];
    let lightLineColor = item[5];
    let darkLineColor = item[6];

    lightColors[lineName] = lightLineColor;
    darkColors[lineName] = darkLineColor;

    let line = [];
    //0: {Name: "Artic Line", Code: "A", Min-SE: "X", Max-NW: "53"}
    if (item[minSE] == "X") {
      line = [lineCode + "X"];
      let max = item[maxNW] as unknown as number;
      for (var i = 0; i <= max; i++) {
        line.push(lineCode + i);
      }
    } else if (item[minSE] == "XHW") {
      line = [lineCode + "X", lineCode + "H", lineCode + "W"];
      let max = item[maxNW] as unknown as number;
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + i);
      }
    } else if (item[nsew] == "NS") {
      let min = item[minSE] as unknown as number;
      for (var i = min; i > 0; i--) {
        line.push(lineCode + "S" + i);
      }
      line.push(lineCode + "0");
      let max = item[maxNW] as unknown as number;
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + "N" + i);
      }
    } else if (item[nsew] == "EW") {
      let min = item[minSE] as unknown as number;
      for (var i = min; i > 0; i--) {
        line.push(lineCode + "E" + i);
      }
      line.push(lineCode + "0");
      let max = item[maxNW] as unknown as number;
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + "W" + i);
      }
    } else {
      let max = item[maxNW] as unknown as number;
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + i);
      }
    }

    //create routes
    for (var i = 0; i < line.length; i++) {
      if (i != 0) {
        routeList.push({
          from: line[i],
          to: line[i - 1],
          mode: "MRT",
          provider: lineName,
        });
      }
      if (i != line.length - 1) {
        routeList.push({
          from: line[i],
          to: line[i + 1],
          mode: "MRT",
          provider: lineName,
        });
      }

      //spawn warps
      if ((i == 0 || i == line.length - 1) && lineName != "circle") {
        spawnWarps.push(line[i]);
      }
    }
  });

  //and generate stop names for place list
  rawStopInfo.forEach((item) => {
    //add place
    if (item[0] == undefined) return;
    placeList.push({
      id: item[0],
      world: "New",
      type: "MRT",
    });
  });

  //and C is a ring line, so add those
  routeList.push({
    from: "C1",
    to: "C119",
    mode: "MRT",
    provider: "circle",
  });
  routeList.push({
    from: "C119",
    to: "C1",
    mode: "MRT",
    provider: "circle",
  });

  //mrt marina shuttle
  routeList.push({
    from: "XE8",
    to: "XEM",
    mode: "MRT",
    provider: "expo",
  });

  routeList.push({
    from: "XEM",
    to: "XE8",
    mode: "MRT",
    provider: "expo",
  });

  routes.push(...routeList);
}

function generateMrtFromMarkers() {
  return new Promise((resolve) => {
    fetch(
      "https://misty-rice-7487.rjwadley.workers.dev/?https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
    )
      .then((response) => {
        return response.json();
      })
      .then((data: any) => {
        resolve(true);

        let sets = data.sets;

        Object.keys(sets).forEach((lineName) => {
          if (
            lineName == "roads.a" ||
            lineName == "roads.b" ||
            lineName == "worldborder.markerset" ||
            lineName == "cities" ||
            lineName == "markers" ||
            lineName == "old"
          )
            return;
          let currentLine = sets[lineName].markers;

          let displayName = sets[lineName].label;

          providers.push({
            name: lineName,
            displayName,
          });

          Object.keys(currentLine).forEach((stopCode) => {
            let currentId = stopCode.toUpperCase();

            //fix id mistakes
            if (currentId == "WN34 STATION") currentId = "WN34";
            if (currentId == "MS") currentId = "MH";
            if (currentId == "M0") currentId = "MW";
            if (currentId == "WH24") currentId = "WN24";

            let name = currentLine[stopCode].label;
            if (name.substr(name.length - 1, name.length) == ")")
              name = name.substr(0, name.length - 3 - currentId.length);

            places.push({
              id: currentId,
              world: "New",
              shortName: currentId,
              longName: name,
              x: currentLine[stopCode].x,
              z: currentLine[stopCode].z,
              type: "MRT",
            });
          });
        });
      });
  });
}

function combineData() {
  let newProviders: Array<LegacyProvider> = [];

  while (providers.length > 0) {
    let current = providers[0].name;
    let find = providers.filter((x) => x.name == current);
    providers = providers.filter((x) => x.name != current);

    let newObject = find[0];

    Object.assign(newObject, ...find);
    newProviders.push(newObject);
  }

  providers = newProviders;

  let newPlaces: Array<LegacyPlace> = [];

  while (places.length > 0) {
    let current = places[0].id;

    let find = places.filter((x) => x.id == current);
    places = places.filter((x) => x.id != current);

    let newObject = find[0];

    Object.assign(newObject, ...find);

    newPlaces.unshift(newObject);
  }

  newPlaces = newPlaces.filter((x) => !ignoredPlaces.includes(x.id));

  places = newPlaces;
}

function generateColors() {
  return;
}

async function loadData() {
  let shouldSort = true;
  if (places.length == 0) shouldSort = false;

  routes = [];
  places = [];
  providers = [];
  codeshares = {};
  spawnWarps = ["C1", "C33", "C61", "C89"];
  lightColors = {};
  darkColors = {};

  let transitSheet: any = getTransitSheet();
  let dataSheet: any = getDataSheet();
  let markers: any = generateMrtFromMarkers();
  let townsheet: any = getTowns();

  transitSheet = await transitSheet;
  dataSheet = await dataSheet;
  markers = await markers;
  await townsheet;

  dataSheet = dataSheet.valueRanges;

  generateMrt(dataSheet[0].values, dataSheet[0].values);

  transitSheet = transitSheet.valueRanges;

  parseRawFlightData(
    "flight",
    transitSheet[0].values,
    transitSheet[1].values[0],
    transitSheet[2].values
  );
  parseRawFlightData(
    "heli",
    transitSheet[3].values,
    transitSheet[4].values[0],
    transitSheet[5].values
  );
  parseRawFlightData(
    "seaplane",
    transitSheet[6].values,
    transitSheet[7].values[0],
    transitSheet[8].values
  );

  await processAirlineMetadata(dataSheet[2].values);

  processAirportMetadata(dataSheet[1].values);
  parseCodeshares(dataSheet[3].values);
  combineData();

  // setItem("routes", routes);
  // setItem("places", places);
  // setItem("providers", providers);
  // setItem("codeshares", codeshares);
  // setItem("spawnWarps", spawnWarps);
  // setItem("lightColors", lightColors);
  // setItem("darkColors", darkColors);

  handoffData(
    routes,
    places,
    providers,
    codeshares,
    spawnWarps,
    lightColors,
    darkColors
  );
}

loadData();
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove } from "firebase/database";

const handoffData = async (
  routes: LegacyRoute[],
  places: LegacyPlace[],
  providers: LegacyProvider[],
  codeshares: {
    [key: string]: {
      [key: string]: string;
    };
  },
  spawnWarps: string[],
  lightColors: {
    [key: string]: string;
  },
  darkColors: {
    [key: string]: string;
  }
) => {
  const firebaseConfig = {
    apiKey: "AIzaSyAk72DEr-1lB3XeRWIHKQ-yq_mTytWXxoo",
    authDomain: "rapidroute-7beef.firebaseapp.com",
    databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
    projectId: "rapidroute-7beef",
    storageBucket: "rapidroute-7beef.appspot.com",
    messagingSenderId: "967487541876",
    appId: "1:967487541876:web:f987b300677d9710e5b721",
    measurementId: "G-3SEGJSYBBW",
  };

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  let refsToRemove: Record<string, boolean> = {};

  // delete all auto generated providers from database
  const providersRef = ref(database, "providers");
  let readOnlyProviders: string[] = [];
  let snapshot = await get(providersRef);
  let providersFromDB: Record<string, Provider> = snapshot.exists()
    ? snapshot.val()
    : {};
  for (let key in providersFromDB) {
    if (providersFromDB[key].autoGenerated === true) {
      refsToRemove["providers/" + key] = true;
      delete providersFromDB[key];
    } else console.log("Provider " + key + " is not auto generated");
  }

  providers.map((x) => {
    let provider: Provider = {
      name: x.name,
      alias: null,
      color: {
        light: lightColors[x.name] ?? null,
        dark: darkColors[x.name] ?? null,
      },
      description: null,
      logo: logos[x.name] ?? null,
      numberPrefix: x.prefix ?? null,
      owner: null,
      autoGenerated: true,
    };
    if (!providersFromDB[makeSafe(x.name)]) {
      refsToRemove["providers/" + makeSafe(x.name)] = false;
      set(ref(database, "providers/" + makeSafe(x.name)), provider);
    } else {
      console.log("Provider " + x.name + " already exists in database");
    }
  });

  console.log("providers set");

  const locationsRef = ref(database, "locations");
  snapshot = await get(locationsRef);

  let locationsFromDB: Record<string, Location> = snapshot.exists()
    ? snapshot.val()
    : {};

  for (let key in locationsFromDB) {
    if (locationsFromDB[key].autoGenerated === true) {
      refsToRemove["locations/" + key] = true;
      delete locationsFromDB[key];
    } else console.log("Location " + key + " is not auto generated");
  }

  places.map((x) => {
    let location: Location = {
      name: x.longName ?? x.shortName ?? "Unnamed Location",
      shortName: x.shortName ?? x.longName ?? "Unnamed Location",
      description: null,
      enabled: true,
      IATA: x.type === "airport" ? x.shortName ?? null : null,
      location:
        x.x && x.z
          ? {
              x: x.x,
              z: x.z,
              y: null,
            }
          : null,
      MRT_TRANSIT_NAME: x.MRT_TRANSIT_NAME ?? null,
      owner: null,
      world: x.world,
      autoGenerated: true,
      isSpawnWarp: spawnWarps.includes(x.id),
      type:
        x.type === "MRT"
          ? "MRT Station"
          : x.type === "airport"
          ? "Airport"
          : x.type === "town"
          ? "City"
          : "Other",
    };
    if (!locationsFromDB[makeSafe(x.id)]) {
      refsToRemove["locations/" + makeSafe(x.id)] = false;
      set(ref(database, "locations/" + makeSafe(x.id)), location);
    } else console.log("Location " + x.id + " already exists in database");
  });
  console.log("locations set");

  const routesRef = ref(database, "routes");
  snapshot = await get(routesRef);
  let routesFromDB: Record<string, Route> = snapshot.exists()
    ? snapshot.val()
    : {};

  for (let key in routesFromDB) {
    if (routesFromDB[key].autoGenerated === true) {
      refsToRemove["routes/" + key] = true;
      delete routesFromDB[key];
    } else console.log("Route " + key + " is not auto generated");
  }

  let routesToIgnore: string[] = [];

  routes.map((x) => {
    let placeA = x.from > x.to ? x.to : x.from;
    let placeB = x.from > x.to ? x.from : x.to;
    let routeId = makeSafe(`${x.provider}-${placeA}-${placeB}`);
    if (routesToIgnore.includes(routeId)) {
      return;
    }
    routesToIgnore.push(routeId);

    let route: Route = {
      autoGenerated: true,
      description: null,
      locations: {
        [makeSafe(x.from)]: x.fromGate ?? null,
        [makeSafe(x.to)]: x.toGate ?? null,
      },
      name: null,
      provider: makeSafe(x.provider),
      type: x.mode,
    };

    if (!routesFromDB[routeId]) {
      refsToRemove["routes/" + routeId] = false;
      set(ref(database, "routes/" + routeId), route);
    } else console.log("Route " + routeId + " already exists in database");
  });

  console.log("routes set");

  for (let key in refsToRemove) {
    if (refsToRemove[key]) {
      console.log("DELETING " + key);
      remove(ref(database, key));
    }
  }

  console.log("ALL DONE");
};

//can't contain ".", "#", "$", "[", "]", or "/" or "\"
const makeSafe = (str: string) => {
  return str.replace(/[\.#$\/\[\]]/g, "_");
};
