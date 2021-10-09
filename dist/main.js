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
const DATA_SHEET_ID = "1qVtW6cSIH-gjJZWrvqJXvQG17ZgRQ7sxXfUjZJcR2lE"; // 3 calls
const AIRPORT_GATE_SHEET = "null"; //1 call
const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps"; //1 call
const TOWN_SHEET_ID = "null";
const API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8";
const VERSION = 0;
//globals
let logos = {};
let colors = {};
let routes = getItem("routes") || [];
let places = getItem("places") || [];
let providers = getItem("providers") || [];
let codeshares = getItem("codeshares") || {};
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
                    "&ranges='Airports'!A3:F500" +
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
function parseCodeshares(codesharesRaw) {
    codesharesRaw.forEach((company, i) => {
        var _a;
        let range = ((_a = company[1]) === null || _a === void 0 ? void 0 : _a.split("-")) || []; //range.split
        if (range.length < 2)
            return;
        colors[company[2]] = company[4]; //colors[displayName] = color
        logos[company[2]] = company[3]; //logos[displayName] = logo
        for (var i = parseInt(range[0]); i <= parseInt(range[1]); i++) {
            //name + number = displayname
            codeshares[company[0] + i] = company[2]; //
        }
    });
}
function processAirportMetadata(rawAirportData) {
    rawAirportData.forEach(rawAirport => {
        var _a;
        let coords = rawAirport[5] ? parseCoordinates(rawAirport[5]) : undefined;
        let id = (_a = rawAirport[1]) !== null && _a !== void 0 ? _a : rawAirport[0];
        if (id == "")
            id = rawAirport[0];
        let world = rawAirport[2];
        if (world != "New" && world != "Old")
            world = "New";
        let newPlace = {
            id,
            world
        };
        let shortName = rawAirport[1];
        if (shortName != "" && shortName != undefined)
            newPlace.shortName = shortName;
        let longName = rawAirport[0];
        if (longName != "" && longName != undefined)
            newPlace.longName = longName;
        let displayName = rawAirport[3];
        if (displayName != "" && displayName != undefined)
            newPlace.displayName = displayName;
        let keywords = rawAirport[4];
        if (keywords != "" && keywords != undefined)
            newPlace.keywords = keywords;
        if (coords != undefined) {
            newPlace.x = coords[0];
            newPlace.z = coords[1];
        }
        places.push(newPlace);
    });
}
function parseCoordinates(coords) {
    let split = coords.split(" ");
    let out = [];
    split.forEach((item, i) => {
        out[i] = parseInt(item.replace(/,/g, ''));
    });
    if (out.length == 3) {
        out[2] = out[3];
        out.pop();
    }
    return out;
}
function processAirlineMetadata(rawAirlineData) {
    return new Promise(resolve => {
        //set legacy gate numbers and
        //request new gate numbers
        let requestURL = "https://sheets.googleapis.com/v4/spreadsheets/" + DATA_SHEET_ID +
            "/values:batchGet?ranges='Legacy Gate Data'!A:D";
        rawAirlineData.forEach((company) => {
            if (company[3])
                logos[company[0]] = company[3];
            if (company[4])
                colors[company[0]] = company[4];
            if (company.length > 1) {
                if (company[1] == "Yes") {
                    requestURL += "&ranges='" + company[0] + "'!A:D";
                }
            }
        });
        $.ajax({
            url: requestURL + "&key=" + API_KEY,
            success: function (result) {
                parseAirlineGateData(result, rawAirlineData, resolve);
            }
        });
    });
}
function parseAirlineGateData(result, companies, resolve) {
    let gateData = [];
    let sheets = result.valueRanges;
    let legacySheet = sheets.shift().values;
    legacySheet.shift();
    //process legacy gates
    companies.forEach((company) => {
        if (company.length > 1) {
            if (company[1] == "Legacy") {
                let flights = legacySheet.filter(x => x[0] == company[2]);
                flights.forEach((item) => {
                    item[0] = company[0];
                });
                gateData = [...gateData, ...flights];
            }
        }
    });
    //process other gates
    sheets.forEach((sheet) => {
        let companyName = "";
        if (sheet.range.indexOf("'") == -1) {
            companyName = sheet.range.split("!")[0];
        }
        else {
            companyName = sheet.range.split("'")[1];
        }
        let flights = sheet.values;
        flights.forEach((flight) => {
            flight[0] = companyName;
        });
        gateData = [...gateData, ...flights];
    });
    //now add gate info to routes
    routes.forEach((route, i) => {
        if (gateData.filter(x => (x[0] == route.provider && x[1] == route.number && x[2] == route.from)).length > 0) {
            routes[i]["hasFromGateData"] = true;
        }
        if (gateData.filter(x => (x[0] == route.provider && x[1] == route.number && x[2] == route.to)).length > 0) {
            routes[i]["hasToGateData"] = true;
        }
    });
    resolve(true);
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
        yield processAirlineMetadata(dataSheet[2].values);
        processAirportMetadata(dataSheet[1].values);
        parseCodeshares(dataSheet[3].values);
        combineData();
        generateTimeMaps(routes, places);
    });
}
loadData();
//# sourceMappingURL=main.js.map