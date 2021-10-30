"use strict";
let voices = window.speechSynthesis.getVoices();
let loop;
let globalRoute;
let phrases;
let progress;
const NAV_WALKING_SPEED = 2;
const NAV_MINECART_SPEED = 8;
function startNavigation(route, resultId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56;
    //@ts-ignore
    mixpanel.track("Navigate", { from: route[0], to: route[route.length - 1] });
    console.log("GENERATING PHRASES");
    speakText("Starting navigation");
    phrases = [];
    globalRoute = [...route];
    let afterWarping = "";
    initNavUI(route, resultId);
    for (let i = 1; i <= route.length - 1; i++) {
        if (route.length == 2) {
            console.log("ROUTE OF LENGTH 2");
            route.push(route[1]);
        }
        let prevPlace = places.filter((x) => x.id == route[i - 1])[0];
        let currentPlace = places.filter((x) => x.id == route[i])[0];
        let nextPlace = places.filter((x) => x.id == route[i + 1])[0];
        let routesBefore = routes.filter((x) => x.from == (prevPlace === null || prevPlace === void 0 ? void 0 : prevPlace.id) &&
            x.to == currentPlace.id &&
            allowedModes.includes(x.mode));
        let routesAfter = routes.filter((x) => x.from == currentPlace.id &&
            x.to == (nextPlace === null || nextPlace === void 0 ? void 0 : nextPlace.id) &&
            allowedModes.includes(x.mode));
        //first set
        if (i == 1) {
            if (allowedModes.includes("spawnWarp") &&
                spawnWarps.includes(currentPlace.id)) {
                afterWarping = "After warping, ";
                speakText("Warp to Spawn");
                if (currentPlace.id != "Spawn")
                    speakText("Then, warp to " +
                        ((_a = currentPlace.shortName) !== null && _a !== void 0 ? _a : currentPlace.id) +
                        ", " +
                        ((_b = currentPlace.displayName) !== null && _b !== void 0 ? _b : currentPlace.longName));
                phrases.push({
                    place: "Spawn",
                    distance: 500,
                    spoken: false,
                    phrase: "Welcome to Central City. Take the warp to " +
                        ((_c = currentPlace.shortName) !== null && _c !== void 0 ? _c : currentPlace.id) +
                        ", " +
                        ((_d = currentPlace.displayName) !== null && _d !== void 0 ? _d : currentPlace.longName),
                });
                route.shift();
                i--;
                continue;
            }
            if ((prevPlace === null || prevPlace === void 0 ? void 0 : prevPlace.type) == "town") {
                route.shift();
                i--;
                continue;
            }
            if (((_e = routesBefore[0]) === null || _e === void 0 ? void 0 : _e.mode) == "MRT") {
                //first set
                // if first route is mrt
                let firstProvider = providers.filter((x) => x.name == routesBefore[0].provider)[0];
                let direction = getDirection(prevPlace.x, prevPlace.z, currentPlace.x, currentPlace.z);
                if (direction)
                    direction += "bound";
                speakText(afterWarping +
                    "Proceed to " +
                    prevPlace.id +
                    ", " +
                    ((_f = prevPlace.displayName) !== null && _f !== void 0 ? _f : prevPlace.longName));
                phrases.push({
                    place: prevPlace.id,
                    distance: 500,
                    spoken: false,
                    phrase: "Take the " +
                        ((_h = (_g = firstProvider.displayName) !== null && _g !== void 0 ? _g : firstProvider.name) !== null && _h !== void 0 ? _h : "") +
                        ", " +
                        (direction !== null && direction !== void 0 ? direction : "") +
                        " towards " +
                        currentPlace.id +
                        ", " +
                        ((_k = (_j = currentPlace.displayName) !== null && _j !== void 0 ? _j : currentPlace.longName) !== null && _k !== void 0 ? _k : ""),
                });
            }
            else if (((_l = routesBefore[0]) === null || _l === void 0 ? void 0 : _l.mode) == "flight") {
                //first route is a  flight
                let then = "";
                if (routesBefore.length == 1) {
                    let firstRoute = routesBefore[0];
                    //get blurb
                    let blurbPrefix;
                    switch (firstRoute.mode) {
                        case "flight":
                            blurbPrefix = "Flight";
                            break;
                        case "seaplane":
                            blurbPrefix = "Seaplane flight";
                            break;
                        case "heli":
                            blurbPrefix = "Helicopter flight";
                            break;
                        default:
                            blurbPrefix = "";
                    }
                    let codeshare;
                    if (firstRoute.number != undefined &&
                        firstRoute.provider != undefined)
                        codeshare = (_m = codeshares === null || codeshares === void 0 ? void 0 : codeshares[firstRoute.provider]) === null || _m === void 0 ? void 0 : _m[firstRoute.number];
                    then =
                        ", then take " +
                            (codeshare !== null && codeshare !== void 0 ? codeshare : firstRoute.provider) +
                            ", " +
                            blurbPrefix +
                            " " +
                            firstRoute.number +
                            ", to " +
                            ((_o = currentPlace.shortName) !== null && _o !== void 0 ? _o : "") +
                            ", " +
                            ((_q = (_p = currentPlace.displayName) !== null && _p !== void 0 ? _p : currentPlace.longName) !== null && _q !== void 0 ? _q : "");
                    if (firstRoute.fromGate != undefined && firstRoute.fromGate != "") {
                        then += ", at Gate " + firstRoute.fromGate;
                    }
                    console.log("THEN", then);
                }
                else {
                    then =
                        ", then take a flight to " +
                            ((_r = currentPlace.shortName) !== null && _r !== void 0 ? _r : "") +
                            ", " +
                            ((_t = (_s = currentPlace.displayName) !== null && _s !== void 0 ? _s : currentPlace.longName) !== null && _t !== void 0 ? _t : "") +
                            ". You have multiple flight options. ";
                    routesBefore.forEach((flight, i) => {
                        var _a;
                        if (i == routesBefore.length - 1) {
                            then += " and ";
                        }
                        //get blurb
                        let blurbPrefix;
                        switch (flight.mode) {
                            case "flight":
                                blurbPrefix = "Flight";
                                break;
                            case "seaplane":
                                blurbPrefix = "Seaplane flight";
                                break;
                            case "heli":
                                blurbPrefix = "Helicopter flight";
                                break;
                            default:
                                blurbPrefix = "";
                        }
                        let codeshare;
                        if (flight.number != undefined && flight.provider != undefined)
                            codeshare = (_a = codeshares === null || codeshares === void 0 ? void 0 : codeshares[flight.provider]) === null || _a === void 0 ? void 0 : _a[flight.number];
                        then +=
                            (codeshare !== null && codeshare !== void 0 ? codeshare : flight.provider) +
                                ", " +
                                blurbPrefix +
                                " " +
                                flight.number;
                        if (flight.fromGate != undefined && flight.fromGate != "") {
                            then += ", at Gate " + flight.fromGate;
                        }
                        then += "... ";
                        //done
                    });
                }
                speakText(afterWarping +
                    "proceed to " +
                    prevPlace.id +
                    ", " +
                    ((_u = prevPlace.displayName) !== null && _u !== void 0 ? _u : prevPlace.longName) +
                    " " +
                    then);
                phrases.push({
                    place: prevPlace.id,
                    distance: 500,
                    spoken: false,
                    phrase: then.substr(6),
                });
            }
            else {
                //walk
                speakText(afterWarping +
                    "Proceed to " +
                    ((_v = prevPlace.shortName) !== null && _v !== void 0 ? _v : prevPlace.id) +
                    ", " +
                    ((_w = prevPlace.displayName) !== null && _w !== void 0 ? _w : prevPlace.longName) +
                    ", then walk to " +
                    ((_x = currentPlace.shortName) !== null && _x !== void 0 ? _x : currentPlace.id) +
                    ", " +
                    ((_y = currentPlace.displayName) !== null && _y !== void 0 ? _y : currentPlace.longName));
                phrases.push({
                    place: prevPlace.id,
                    distance: 500,
                    spoken: false,
                    phrase: "walk to " +
                        ((_z = currentPlace.shortName) !== null && _z !== void 0 ? _z : currentPlace.id) +
                        ", " +
                        ((_0 = currentPlace.displayName) !== null && _0 !== void 0 ? _0 : currentPlace.longName),
                });
                route.shift();
                i--;
            }
        }
        if (i + 1 == route.length - 1) {
            //last set
            console.log("Last Set");
            //approaching via MRT
            if (prevPlace.type == "MRT" && currentPlace.type == "MRT") {
                if (routesAfter.length == 0 && nextPlace.id != currentPlace.id) {
                    if (nextPlace.x != undefined &&
                        nextPlace.z != undefined &&
                        currentPlace.x != undefined &&
                        currentPlace.z != undefined &&
                        getDistance(nextPlace.x, nextPlace.z, currentPlace.x, currentPlace.z) < 250 &&
                        nextPlace.type == "MRT") {
                        //phrases for reaching the end of a route via MRT
                        phrases.push({
                            place: currentPlace.id,
                            distance: 1000,
                            spoken: false,
                            phrase: "In two minutes, transfer to your destination, " +
                                nextPlace.id +
                                ", " +
                                ((_2 = (_1 = nextPlace.displayName) !== null && _1 !== void 0 ? _1 : nextPlace.longName) !== null && _2 !== void 0 ? _2 : ""),
                        });
                        phrases.push({
                            place: currentPlace.id,
                            distance: 300,
                            spoken: false,
                            phrase: "At the next stop, transfer to your destination",
                        });
                        phrases.push({
                            place: currentPlace.id,
                            distance: 50,
                            spoken: false,
                            phrase: "Transfer to your destination, " +
                                nextPlace.id +
                                ", " +
                                ((_4 = (_3 = nextPlace.displayName) !== null && _3 !== void 0 ? _3 : nextPlace.longName) !== null && _4 !== void 0 ? _4 : ""),
                        });
                        continue;
                    }
                    else {
                        //phrases for reaching the end of a route via MRT
                        phrases.push({
                            place: currentPlace.id,
                            distance: 1000,
                            spoken: false,
                            phrase: "In two minutes, walk to your destination, " +
                                ((_6 = (_5 = nextPlace.shortName) !== null && _5 !== void 0 ? _5 : nextPlace.id) !== null && _6 !== void 0 ? _6 : "") +
                                ", " +
                                ((_8 = (_7 = nextPlace.displayName) !== null && _7 !== void 0 ? _7 : nextPlace.longName) !== null && _8 !== void 0 ? _8 : ""),
                        });
                        phrases.push({
                            place: currentPlace.id,
                            distance: 300,
                            spoken: false,
                            phrase: "At the next stop, walk to your destination",
                        });
                        phrases.push({
                            place: currentPlace.id,
                            distance: 50,
                            spoken: false,
                            phrase: "Walk to your destination, " +
                                ((_10 = (_9 = nextPlace.shortName) !== null && _9 !== void 0 ? _9 : nextPlace.id) !== null && _10 !== void 0 ? _10 : "") +
                                ", " +
                                ((_12 = (_11 = nextPlace.displayName) !== null && _11 !== void 0 ? _11 : nextPlace.longName) !== null && _12 !== void 0 ? _12 : ""),
                        });
                        continue;
                    }
                }
                else {
                    //arrive via MRT
                    console.log("3x At", nextPlace.id, "you will reach your destination", nextPlace.id);
                    //phrases for reaching the end of a route via MRT
                    phrases.push({
                        place: nextPlace.id,
                        distance: 1000,
                        spoken: false,
                        phrase: "In two minutes, you will reach your destination, " +
                            nextPlace.id +
                            ", " +
                            ((_14 = (_13 = nextPlace.displayName) !== null && _13 !== void 0 ? _13 : nextPlace.longName) !== null && _14 !== void 0 ? _14 : ""),
                    });
                    phrases.push({
                        place: nextPlace.id,
                        distance: 300,
                        spoken: false,
                        phrase: "At the next stop, you will reach your destination",
                    });
                    phrases.push({
                        place: nextPlace.id,
                        distance: 50,
                        spoken: false,
                        phrase: "You have reached your destination, " +
                            nextPlace.id +
                            ", " +
                            ((_16 = (_15 = nextPlace.displayName) !== null && _15 !== void 0 ? _15 : nextPlace.longName) !== null && _16 !== void 0 ? _16 : ""),
                    });
                }
            }
            else if (currentPlace.type == "airport" &&
                nextPlace.type == "airport") {
                setTimeout(function () {
                    var _a, _b, _c;
                    phrases.push({
                        place: nextPlace.id,
                        distance: -1,
                        spoken: false,
                        phrase: "You have reached your destination, " +
                            ((_a = nextPlace.shortName) !== null && _a !== void 0 ? _a : nextPlace.id) +
                            ", " +
                            ((_c = (_b = nextPlace.displayName) !== null && _b !== void 0 ? _b : nextPlace.longName) !== null && _c !== void 0 ? _c : ""),
                    });
                }, 10);
            }
        }
        if (nextPlace == undefined)
            continue;
        //approaching via MRT
        if (prevPlace.type == "MRT" && currentPlace.type == "MRT") {
            //transfer or walk to next station
            if (nextPlace.type == "MRT" && routesBefore.length == 0) {
                console.log("3x At", prevPlace.id, "transfer or walk to ", currentPlace.id);
                let provider = routes.filter((x) => x.from == currentPlace.id)[0]
                    .provider;
                let transferToProvider = providers.filter((x) => x.name == provider)[0];
                let direction = getDirection(currentPlace.x, currentPlace.z, nextPlace.x, nextPlace.z);
                if (direction)
                    direction += "bound";
                if (currentPlace.x != undefined &&
                    currentPlace.z != undefined &&
                    prevPlace.x != undefined &&
                    prevPlace.z != undefined &&
                    getDistance(currentPlace.x, currentPlace.z, prevPlace.x, prevPlace.z) < 250) {
                    let phrase = "transfer to the " +
                        (direction !== null && direction !== void 0 ? direction : "") +
                        " " +
                        ((_17 = transferToProvider.displayName) !== null && _17 !== void 0 ? _17 : transferToProvider.name) +
                        ", towards " +
                        nextPlace.id +
                        ", " +
                        ((_19 = (_18 = nextPlace.displayName) !== null && _18 !== void 0 ? _18 : nextPlace.longName) !== null && _19 !== void 0 ? _19 : "");
                    if (i != 0) {
                        phrases.push({
                            place: prevPlace.id,
                            distance: 1000,
                            spoken: false,
                            phrase: "In two minutes, " + phrase,
                        });
                        phrases.push({
                            place: prevPlace.id,
                            distance: 300,
                            spoken: false,
                            phrase: "At the next stop, " + phrase,
                        });
                    }
                    phrases.push({
                        place: prevPlace.id,
                        distance: 50,
                        spoken: false,
                        phrase: phrase,
                    });
                }
                else {
                    let phrase = "walk to " +
                        currentPlace.id +
                        ", " +
                        ((_21 = (_20 = currentPlace.displayName) !== null && _20 !== void 0 ? _20 : currentPlace.longName) !== null && _21 !== void 0 ? _21 : "") +
                        ", then take the " +
                        (direction !== null && direction !== void 0 ? direction : "") +
                        " " +
                        ((_22 = transferToProvider.displayName) !== null && _22 !== void 0 ? _22 : transferToProvider.name) +
                        ", towards " +
                        nextPlace.id +
                        ", " +
                        ((_24 = (_23 = nextPlace.displayName) !== null && _23 !== void 0 ? _23 : nextPlace.longName) !== null && _24 !== void 0 ? _24 : "");
                    phrases.push({
                        place: prevPlace.id,
                        distance: 1000,
                        spoken: false,
                        phrase: "In two minutes, " + phrase,
                    });
                    phrases.push({
                        place: prevPlace.id,
                        distance: 300,
                        spoken: false,
                        phrase: "At the next stop, " + phrase,
                    });
                    phrases.push({
                        place: prevPlace.id,
                        distance: 50,
                        spoken: false,
                        phrase: phrase,
                    });
                    phrases.push({
                        place: currentPlace.id,
                        distance: 500,
                        spoken: false,
                        phrase: "Take the " +
                            ((_26 = (_25 = transferToProvider.displayName) !== null && _25 !== void 0 ? _25 : transferToProvider.name) !== null && _26 !== void 0 ? _26 : "") +
                            ", " +
                            (direction !== null && direction !== void 0 ? direction : "") +
                            " towards " +
                            nextPlace.id +
                            ", " +
                            ((_28 = (_27 = nextPlace.displayName) !== null && _27 !== void 0 ? _27 : nextPlace.longName) !== null && _28 !== void 0 ? _28 : ""),
                    });
                }
                continue;
            }
            //transfer to airport
            if (nextPlace.type == "airport") {
                console.log("3x At", currentPlace.id, "walk to ", nextPlace.id, "then catch flight");
                let then = "";
                //jump one ahead to get flight data
                if (route[i + 2] != undefined) {
                    prevPlace = places.filter((x) => x.id == route[i])[0];
                    currentPlace = places.filter((x) => x.id == route[i + 1])[0];
                    nextPlace = places.filter((x) => x.id == route[i + 2])[0];
                    routesAfter = routes.filter((x) => x.from == currentPlace.id && x.to == nextPlace.id);
                }
                if (routesAfter.length > 0) {
                    if (routesAfter.length == 1) {
                        let nextRoute = routesAfter[0];
                        //get blurb
                        let blurbPrefix;
                        switch (nextRoute.mode) {
                            case "flight":
                                blurbPrefix = "Flight";
                                break;
                            case "seaplane":
                                blurbPrefix = "Seaplane flight";
                                break;
                            case "heli":
                                blurbPrefix = "Helicopter flight";
                                break;
                            default:
                                blurbPrefix = "";
                        }
                        let codeshare;
                        if (nextRoute.number != undefined &&
                            nextRoute.provider != undefined)
                            codeshare = (_29 = codeshares === null || codeshares === void 0 ? void 0 : codeshares[nextRoute.provider]) === null || _29 === void 0 ? void 0 : _29[nextRoute.number];
                        then =
                            ", then take " +
                                (codeshare !== null && codeshare !== void 0 ? codeshare : nextRoute.provider) +
                                ", " +
                                blurbPrefix +
                                " " +
                                nextRoute.number +
                                ", to " +
                                ((_30 = nextPlace.shortName) !== null && _30 !== void 0 ? _30 : "") +
                                ", " +
                                ((_32 = (_31 = nextPlace.displayName) !== null && _31 !== void 0 ? _31 : nextPlace.longName) !== null && _32 !== void 0 ? _32 : "");
                        if (nextRoute.fromGate != undefined && nextRoute.fromGate != "") {
                            then += ", at Gate " + nextRoute.fromGate;
                        }
                        console.log("THEN", then);
                    }
                    else {
                        then =
                            ", then take a flight to " +
                                ((_33 = nextPlace.shortName) !== null && _33 !== void 0 ? _33 : "") +
                                ", " +
                                ((_35 = (_34 = nextPlace.displayName) !== null && _34 !== void 0 ? _34 : nextPlace.longName) !== null && _35 !== void 0 ? _35 : "") +
                                ". You have multiple flight options. ";
                        routesAfter.forEach((flight, i) => {
                            var _a;
                            if (i == routesAfter.length - 1) {
                                then += " and ";
                            }
                            //get blurb
                            let blurbPrefix;
                            switch (flight.mode) {
                                case "flight":
                                    blurbPrefix = "Flight";
                                    break;
                                case "seaplane":
                                    blurbPrefix = "Seaplane flight";
                                    break;
                                case "heli":
                                    blurbPrefix = "Helicopter flight";
                                    break;
                                default:
                                    blurbPrefix = "";
                            }
                            let codeshare;
                            if (flight.number != undefined && flight.provider != undefined)
                                codeshare = (_a = codeshares === null || codeshares === void 0 ? void 0 : codeshares[flight.provider]) === null || _a === void 0 ? void 0 : _a[flight.number];
                            then +=
                                (codeshare !== null && codeshare !== void 0 ? codeshare : flight.provider) +
                                    ", " +
                                    blurbPrefix +
                                    " " +
                                    flight.number;
                            if (flight.fromGate != undefined && flight.fromGate != "") {
                                then += ", at Gate " + flight.fromGate;
                            }
                            then += "... ";
                            //done
                        });
                    }
                }
                let phrase = "walk to " +
                    ((_36 = currentPlace.shortName) !== null && _36 !== void 0 ? _36 : "") +
                    ", " +
                    ((_37 = currentPlace.displayName) !== null && _37 !== void 0 ? _37 : currentPlace.longName);
                phrases.push({
                    place: prevPlace.id,
                    distance: 1000,
                    spoken: false,
                    phrase: "In two minutes, " + phrase + then,
                });
                phrases.push({
                    place: prevPlace.id,
                    distance: 300,
                    spoken: false,
                    phrase: "At the next stop, " + phrase,
                });
                phrases.push({
                    place: prevPlace.id,
                    distance: 50,
                    spoken: false,
                    phrase: phrase + then,
                });
                continue;
            }
            //walk to next spot
            if (routesAfter.length == 0) {
                console.log("3x At", currentPlace.id, "walk to ", nextPlace.id);
                continue;
            }
            //otherwise normal mrt, just stay silent
            console.log("stay on mrt");
            continue;
        }
        //arriving by plane
        if (prevPlace.type == "airport" &&
            currentPlace.type == "airport" &&
            nextPlace.type != "MRT") {
            let then = "";
            if (routesAfter.length > 0) {
                if (routesAfter.length == 1) {
                    let nextRoute = routesAfter[0];
                    //get blurb
                    let blurbPrefix;
                    switch (nextRoute.mode) {
                        case "flight":
                            blurbPrefix = "Flight";
                            break;
                        case "seaplane":
                            blurbPrefix = "Seaplane flight";
                            break;
                        case "heli":
                            blurbPrefix = "Helicopter flight";
                            break;
                        default:
                            blurbPrefix = "";
                    }
                    let codeshare;
                    if (nextRoute.number != undefined && nextRoute.provider != undefined)
                        codeshare = (_38 = codeshares === null || codeshares === void 0 ? void 0 : codeshares[nextRoute.provider]) === null || _38 === void 0 ? void 0 : _38[nextRoute.number];
                    then =
                        "take " +
                            (codeshare !== null && codeshare !== void 0 ? codeshare : nextRoute.provider) +
                            ", " +
                            blurbPrefix +
                            " " +
                            nextRoute.number +
                            ", to " +
                            ((_39 = nextPlace.shortName) !== null && _39 !== void 0 ? _39 : "") +
                            ", " +
                            ((_41 = (_40 = nextPlace.displayName) !== null && _40 !== void 0 ? _40 : nextPlace.longName) !== null && _41 !== void 0 ? _41 : "");
                    if (nextRoute.fromGate != undefined && nextRoute.fromGate != "") {
                        then += ", at Gate " + nextRoute.fromGate;
                    }
                }
                else {
                    then =
                        "take a flight to " +
                            ((_42 = nextPlace.shortName) !== null && _42 !== void 0 ? _42 : "") +
                            ", " +
                            ((_44 = (_43 = nextPlace.displayName) !== null && _43 !== void 0 ? _43 : nextPlace.longName) !== null && _44 !== void 0 ? _44 : "") +
                            ". You have multiple flight options. ";
                    routesAfter.forEach((flight, i) => {
                        var _a;
                        if (i == routesAfter.length - 1) {
                            then += " and ";
                        }
                        //get blurb
                        let blurbPrefix;
                        switch (flight.mode) {
                            case "flight":
                                blurbPrefix = "Flight";
                                break;
                            case "seaplane":
                                blurbPrefix = "Seaplane flight";
                                break;
                            case "heli":
                                blurbPrefix = "Helicopter flight";
                                break;
                            default:
                                blurbPrefix = "";
                        }
                        let codeshare;
                        if (flight.number != undefined && flight.provider != undefined)
                            codeshare = (_a = codeshares === null || codeshares === void 0 ? void 0 : codeshares[flight.provider]) === null || _a === void 0 ? void 0 : _a[flight.number];
                        then +=
                            (codeshare !== null && codeshare !== void 0 ? codeshare : flight.provider) +
                                ", " +
                                blurbPrefix +
                                " " +
                                flight.number;
                        if (flight.fromGate != undefined && flight.fromGate != "") {
                            then += ", at Gate " + flight.fromGate;
                        }
                        then += "... ";
                        //done
                    });
                }
            }
            else {
                if (nextPlace.id == currentPlace.id)
                    continue;
                then =
                    "walk to " +
                        ((_45 = nextPlace.shortName) !== null && _45 !== void 0 ? _45 : nextPlace.id) +
                        ", " +
                        ((_47 = (_46 = nextPlace.displayName) !== null && _46 !== void 0 ? _46 : nextPlace.longName) !== null && _47 !== void 0 ? _47 : "");
            }
            let phrase = "Welcome to " +
                ((_49 = (_48 = currentPlace.displayName) !== null && _48 !== void 0 ? _48 : currentPlace.longName) !== null && _49 !== void 0 ? _49 : currentPlace.shortName) +
                "... ";
            phrases.push({
                place: currentPlace.id,
                distance: -1,
                spoken: false,
                phrase: phrase + then,
            });
            console.log("flight");
        }
        if (prevPlace.type == "airport" && currentPlace.type == "MRT") {
            let provider = routes.filter((x) => x.from == currentPlace.id)[0]
                .provider;
            let transferToProvider = providers.filter((x) => x.name == provider)[0];
            let direction = getDirection(currentPlace.x, currentPlace.z, nextPlace.x, nextPlace.z);
            if (direction)
                direction += "bound";
            let then = "take the " +
                (direction !== null && direction !== void 0 ? direction : "") +
                " " +
                ((_50 = transferToProvider.displayName) !== null && _50 !== void 0 ? _50 : transferToProvider.name) +
                ", towards " +
                nextPlace.id +
                ", " +
                ((_52 = (_51 = nextPlace.displayName) !== null && _51 !== void 0 ? _51 : nextPlace.longName) !== null && _52 !== void 0 ? _52 : "");
            let phrase = "Welcome to " +
                ((_54 = (_53 = prevPlace.displayName) !== null && _53 !== void 0 ? _53 : prevPlace.longName) !== null && _54 !== void 0 ? _54 : prevPlace.shortName) +
                "... walk to " +
                ((_55 = currentPlace.shortName) !== null && _55 !== void 0 ? _55 : currentPlace.id) +
                ", " +
                ((_56 = currentPlace.displayName) !== null && _56 !== void 0 ? _56 : currentPlace.longName) +
                ", then ";
            phrases.push({
                place: prevPlace.id,
                distance: -1,
                spoken: false,
                phrase: phrase + then,
            });
            phrases.push({
                place: currentPlace.id,
                distance: 50,
                spoken: false,
                phrase: then,
            });
        }
    }
    clearInterval(loop);
    navigationLoop();
    loop = setInterval(navigationLoop, 5000);
}
let instructionArray;
function initNavUI(route, resultId) {
    console.log(route, resultId);
    instructionArray = $(".route").eq(0).children(".leg").clone();
    if (getItem("playername") == null || getItem("playername") == "") {
        setItem("playername", prompt("Enter your Minecraft username (case-sensitive)"));
    }
    let playername = getItem("playername");
    //TODO FIX
    $(".nav-container").css("display", "grid");
    $(".nav-summary").children(".nav-summary-item").remove();
    $("body").css("overflow", "hidden");
    route.forEach((placeId) => {
        var _a, _b, _c;
        let place = places.filter((x) => x.id == placeId)[0];
        $(".nav-summary").append(`<div class="nav-summary-item">
      <p>
        <span>${(_a = place.shortName) !== null && _a !== void 0 ? _a : place.id}</span>
         - ${(_c = (_b = place.displayName) !== null && _b !== void 0 ? _b : place.longName) !== null && _c !== void 0 ? _c : ""}
       </p>
    </div>`);
    });
    $(".playerhead img").attr("src", "https://dynmap.minecartrapidtransit.net/tiles/faces/16x16/" +
        playername +
        ".png");
    setTimeout(function () {
        $("#dynmap").attr("src", `https://dynmap.minecartrapidtransit.net/?playername=${playername}&zoom=6`);
    }, 1000);
}
let isSpeaking = false;
let speakQueue = [];
function speakText(text) {
    console.log("SPEAK NOW", text);
    if (speakQueue.length == 0 && isSpeaking == false) {
        console.log("Speak CANCELLING PREEMPTIVELY");
        //gah the speechSynthesis api is the worst
        speechSynthesis.cancel();
        speakQueue.push(text);
        triggerSpeakQueue();
    }
    else {
        speakQueue.push(text);
    }
}
function triggerSpeakQueue() {
    let text = speakQueue[0];
    if (text == undefined)
        return;
    let speakInterval = setInterval(function () {
        if (isSpeaking == false) {
            console.log("Has not spoken yet, retrying");
            speechSynthesis.cancel();
            triggerSpeakQueue();
        }
    }, 3000);
    voices = window.speechSynthesis.getVoices();
    voices = voices.filter((x) => x.name.toLowerCase().indexOf("english") != -1);
    console.log(voices);
    var msg = new SpeechSynthesisUtterance();
    msg.voice = voices[6];
    msg.volume = 1; // 0 to 1
    msg.rate = 1; // 0.1 to 10
    msg.pitch = 1; //0 to 2
    msg.text = text;
    msg.lang = "en-US";
    msg.onend = function (e) {
        console.log("Speak Finished in " + e.elapsedTime + " mseconds.");
        isSpeaking = false;
        speakQueue.shift();
        clearInterval(speakInterval);
        triggerSpeakQueue();
    };
    msg.onstart = function (e) {
        isSpeaking = true;
        console.log("Speak Started in " + e.elapsedTime + " mseconds.");
    };
    msg.onerror = function (event) {
        console.log("Speak An error has occurred with the speech synthesis: " + event.error);
        isSpeaking = false;
        speakQueue.shift();
        triggerSpeakQueue();
    };
    speechSynthesis.speak(msg);
}
function getDistance(x1, y1, x2, y2) {
    let x = x2 - x1;
    let y = y2 - y1;
    let distance = Math.ceil(Math.sqrt(x * x + y * y));
    return distance;
}
function getDirection(x1, z1, x2, z2) {
    if (x1 == undefined || x2 == undefined || z1 == undefined || z2 == undefined)
        return undefined;
    let x = x2 - x1;
    let z = -(z2 - z1);
    let direction = (Math.atan2(x, z) / Math.PI) * 180;
    direction += 45;
    if (direction < 0)
        direction += 360;
    if (direction < 90) {
        return "North";
    }
    if (direction < 180) {
        return "East";
    }
    if (direction < 270) {
        return "South";
    }
    return "West";
}
let lastPlayer;
function navigationLoop() {
    console.log("loop");
    fetch(`https://jsonp.afeld.me/?url=https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json`)
        .then((response) => {
        return response.json();
    })
        .then((res) => {
        let data = res;
        let player = data.players.filter((x) => x.name == getItem("playername"))[0];
        if (player == undefined) {
            console.log("Player not found");
            return;
        }
        let routePlaces = places.filter((x) => globalRoute.includes(x.id));
        let shortestDistance = Infinity;
        let offset = 0;
        globalRoute.forEach((placeId, i) => {
            if (i < 1)
                return;
            let place = places.filter((x) => x.id == placeId)[0];
            let prevPlace = places.filter((x) => x.id == globalRoute[i - 1])[0];
            if (place.x == undefined || place.z == undefined)
                return;
            if (prevPlace.x == undefined || prevPlace.z == undefined)
                return;
            let result = Math.atan2(prevPlace.z - player.z, prevPlace.x - player.x) -
                Math.atan2(place.z - player.z, place.x - player.x);
            result = result / Math.PI;
            console.log("ANGLE", place.id, prevPlace.id, result / Math.PI);
            let firstDistance = getDistance(player.x, player.z, prevPlace.x, prevPlace.z);
            let secondDistance = getDistance(player.x, player.z, place.x, place.z);
            if (Math.abs(result) > 0.4 ||
                firstDistance < 50 ||
                secondDistance < 50) {
                if (firstDistance + secondDistance < shortestDistance) {
                    shortestDistance = firstDistance + secondDistance;
                    let ratio = (firstDistance / (firstDistance + secondDistance)) * 60;
                    let startIndex = globalRoute.indexOf(prevPlace.id);
                    offset = startIndex * 60 + ratio;
                    offset += 25;
                    console.log("firstDistance, secondDistance", firstDistance, secondDistance);
                    console.log("ratio, start, offset", ratio, startIndex, offset);
                }
            }
        });
        $(".playerhead").css("top", offset + "px");
        if (navigationCanScroll == true)
            $(".nav-summary").animate({
                scrollTop: offset - 30,
            }, 5000, "linear");
        let phrase = phrases[0];
        let place = places.filter((x) => x.id == phrase.place)[0];
        let instruction = instructionArray.filter((i) => $(instructionArray[i]).attr("data-place") == phrase.place)[0];
        $(".nav-instruction").remove();
        $(".nav-container").append($(instruction).addClass("nav-instruction").removeClass("no-shadow"));
        if (phrase.distance == -1) {
            if (lastPlayer == undefined)
                return;
            let distanceMoved = getDistance(player.x, player.z, lastPlayer.x, lastPlayer.z);
            if (distanceMoved > 2000) {
                console.log("MOVED A LOT, TRIGGERING PHRASE");
                if (place.x == undefined || place.z == undefined) {
                    console.log("location not defined");
                    alertSound.play();
                    speakText(phrase.phrase);
                    phrases.shift();
                }
                else {
                    console.log("location defined");
                    let distance = getDistance(player.x, player.z, place.x, place.z);
                    console.log(distance);
                    if (distance < 2000) {
                        alertSound.play();
                        speakText(phrase.phrase);
                        phrases.shift();
                    }
                }
            }
        }
        else {
            if (place.x == undefined || place.z == undefined) {
                console.log("UNREACHABLE PLACE");
                speakText(phrase.phrase);
                phrases.shift();
            }
            else {
                let distance = getDistance(player.x, player.z, place.x, place.z);
                if (distance < phrase.distance && phrase.spoken == false) {
                    alertSound.play();
                    speakText(phrase.phrase);
                    phrases.shift();
                }
            }
        }
        if (0 == phrases.length) {
            alertSound.load();
            successSound.play();
            speakText("Navigation complete");
            clearInterval(loop);
        }
        lastPlayer = player;
    });
}
let navigationCanScroll = true;
let scrollTimeout;
$(".nav-summary").on("mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function () {
    $(this).stop();
    navigationCanScroll = false;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
        navigationCanScroll = true;
    }, 10 * 1000);
});
$(".exit-nav").on("click", function () {
    clearTimeout(loop);
    $(".nav-container").css("display", "none");
    $("body").css("overflow", "unset");
});
let successSound = new Audio("audio/complete.mp3");
let alertSound = new Audio("audio/alert.mp3");
//# sourceMappingURL=navigate.js.map