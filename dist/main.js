"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DATA_SHEET_ID = "1qVtW6cSIH-gjJZWrvqJXvQG17ZgRQ7sxXfUjZJcR2lE";
const AIRLINE_GATE_SHEET_ID = "13t7mHiW9HZjbx9eFP2uTAO5tLyAelt5_iITqym2Ejn8";
const AIRPORT_GATE_SHEET_ID = "143ztIeSiTV1QPltYqS2__4SwEi7P2zOuccCTtLtsCus";
const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps";
const API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8";
const VERSION = 0;
//globals
let logos = {};
let colors = {};
let routes = getItem("routes") || [];
let places = getItem("places") || [];
let providers = getItem("providers") || [];
function getTransitSheet() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            $.ajax({
                url: "https://sheets.googleapis.com/v4/spreadsheets/" + DATA_SHEET_ID + "/values:batchGet?" +
                    "ranges='MRT Transit'!B3:B5" + //row info
                    "&ranges='MRT Transit'!F3:F5" + //column info
                    "&key=" + API_KEY,
                success: function (result) {
                    let rows = result.valueRanges[0].values;
                    let cols = result.valueRanges[1].values;
                    //now get transit sheet
                    $.ajax({
                        url: "https://sheets.googleapis.com/v4/spreadsheets/" + TRANSIT_SHEET_ID + "/values:batchGet?" +
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
                            "&key=" + API_KEY,
                        success: function (result) {
                            resolve(result);
                        }
                    });
                }
            });
        });
    });
}
function getDataSheet() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            $.ajax({
                url: "https://sheets.googleapis.com/v4/spreadsheets/" + DATA_SHEET_ID + "/values:batchGet?" +
                    "ranges='MRT'!B2:G19" + //mrt info
                    "&ranges='MRT'!B24:D1133" + //mrt stop names
                    "&ranges='Airports'!A2:D500" +
                    "&ranges='Companies'!A2:E200" +
                    "&ranges='CodeSharing'!A3:E200" +
                    "&key=" + API_KEY,
                success: function (result) {
                    resolve(result);
                }
            });
        });
    });
}
function getAirlineGates(companies) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(companies);
    });
}
function getAirportGates() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function parseRawFlightData(mode, placesRaw, providersRaw, routesRaw) {
    //first parse the places
    let placeList = [];
    placesRaw.forEach(place => {
        let world = place[2]; //default to new
        if (world != "Old" && world != "New") {
            world = "New";
        }
        placeList.push({
            id: place[1] || place[0],
            world: world,
            shortName: place[1],
            longName: place[0]
        });
    });
    places.push(...placeList); //add to global
    routesRaw = transpose(routesRaw); //routeData needs to be transposed
    let airlines = [];
    let flights = [];
    //for each airline
    providersRaw.forEach((airline, i) => {
        var _a;
        airlines.push({ name: airline });
        let flightsByNumber = {};
        (_a = routesRaw[i]) === null || _a === void 0 ? void 0 : _a.forEach((cell, j) => {
            if (cell == "" || cell == undefined)
                return; //skip if empty
            cell.split(",").forEach((flight) => {
                // add to flightsByNumber
                flight = flight.trim();
                if (flightsByNumber[flight] == undefined) {
                    flightsByNumber[flight] = [];
                }
                flightsByNumber[flight].push(placeList[j]);
            });
        });
        Object.keys(flightsByNumber).forEach(flightNumber => {
            flightsByNumber[flightNumber].forEach(destinationA => {
                flightsByNumber[flightNumber].forEach(destinationB => {
                    if (destinationA == destinationB)
                        return;
                    flights.push({
                        from: destinationA.id,
                        to: destinationB.id,
                        mode: mode,
                        provider: airline,
                        number: flightNumber
                    });
                });
            });
        });
    });
    routes.push(...flights);
    providers.push(...airlines);
}
function generateMrt(rawMRTInfo, rawStopInfo) {
    let routeList = [];
    let placeList = [];
    //generate list of MRT stop routes
    rawMRTInfo.forEach((item, i) => {
        let minSE = 2;
        let maxNW = 3;
        let nsew = 4;
        let lineCode = item[1];
        let lineName = item[0];
        let lineColor = item[5];
        colors[lineName] = lineColor;
        let line = [];
        //0: {Name: "Artic Line", Code: "A", Min-SE: "X", Max-NW: "53"}
        if (item[minSE] == "X") {
            line = [lineCode + "X"];
            let max = item[maxNW];
            for (var i = 0; i <= max; i++) {
                line.push(lineCode + i);
            }
        }
        else if (item[minSE] == "XHW") {
            line = [lineCode + "X", lineCode + "H", lineCode + "W"];
            let max = item[maxNW];
            for (var i = 1; i <= max; i++) {
                line.push(lineCode + i);
            }
        }
        else if (item[nsew] == "NS") {
            let min = item[minSE];
            for (var i = min; i > 0; i--) {
                line.push(lineCode + "S" + i);
            }
            line.push(lineCode + "0");
            let max = item[maxNW];
            for (var i = 1; i <= max; i++) {
                line.push(lineCode + "N" + i);
            }
        }
        else if (item[nsew] == "EW") {
            let min = item[minSE];
            for (var i = min; i > 0; i--) {
                line.push(lineCode + "E" + i);
            }
            line.push(lineCode + "0");
            let max = item[maxNW];
            for (var i = 1; i <= max; i++) {
                line.push(lineCode + "W" + i);
            }
        }
        else {
            let max = item[maxNW];
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
        }
    });
    //and generate stop names for place list
    rawStopInfo.forEach((item) => {
        //add place
        if (item[0] == undefined)
            return;
        placeList.push({
            id: item[0],
            world: "New"
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
    routes.push(...routeList);
}
function generateMrtFromMarkers() {
    return new Promise(resolve => {
        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json')}`)
            .then(response => {
            return response.json();
        }).then(data => {
            data = JSON.parse(data.contents);
            console.log(data);
            resolve(true);
            let sets = data.sets;
            Object.keys(sets).forEach(lineName => {
                if (lineName == "roads.a" || lineName == "roads.b" ||
                    lineName == "worldborder.markerset" || lineName == "cities"
                    || lineName == "markers" || lineName == "old")
                    return;
                let currentLine = sets[lineName].markers;
                let displayName = sets[lineName].label;
                providers.push({
                    name: lineName,
                    displayName
                });
                Object.keys(currentLine).forEach(stopCode => {
                    let currentId = stopCode.toUpperCase();
                    //fix id mistakes
                    if (currentId == "WN34 STATION")
                        currentId = "WN34";
                    if (currentId == "MS")
                        currentId = "MH";
                    if (currentId == "M0")
                        currentId = "MW";
                    if (currentId == "WH24")
                        currentId = "WN24";
                    let name = currentLine[stopCode].label;
                    if (name.substr(name.length - 1, name.length) == ")")
                        name = name.substr(0, name.length - 3 - currentId.length);
                    places.push({
                        id: currentId,
                        world: "New",
                        shortName: currentId,
                        longName: name,
                        x: currentLine[stopCode].x,
                        z: currentLine[stopCode].z
                    });
                });
            });
        });
    });
}
function combineData() {
    let newProviders = [];
    while (providers.length > 0) {
        let current = providers[0].name;
        let find = providers.filter(x => x.name == current);
        providers = providers.filter(x => x.name != current);
        let newObject = find[0];
        Object.assign(newObject, ...find);
        newProviders.push(newObject);
    }
    providers = newProviders;
    let newPlaces = [];
    while (places.length > 0) {
        let current = places[0].id;
        let find = places.filter(x => x.id == current);
        places = places.filter(x => x.id != current);
        let newObject = find[0];
        Object.assign(newObject, ...find);
        newPlaces.unshift(newObject);
    }
    places = newPlaces;
}
function loadData() {
    return __awaiter(this, void 0, void 0, function* () {
        let transitSheet = getTransitSheet();
        let dataSheet = getDataSheet();
        let markers = generateMrtFromMarkers();
        transitSheet = yield transitSheet;
        dataSheet = yield dataSheet;
        markers = yield markers;
        dataSheet = dataSheet.valueRanges;
        generateMrt(dataSheet[0].values, dataSheet[0].values);
        transitSheet = transitSheet.valueRanges;
        parseRawFlightData("flight", transitSheet[0].values, transitSheet[1].values[0], transitSheet[2].values);
        parseRawFlightData("heli", transitSheet[3].values, transitSheet[4].values[0], transitSheet[5].values);
        parseRawFlightData("seaplane", transitSheet[6].values, transitSheet[7].values[0], transitSheet[8].values);
        combineData();
        generateTimeMap();
    });
}
loadData();
//# sourceMappingURL=main.js.map