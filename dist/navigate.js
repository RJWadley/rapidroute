"use strict";
let voices = window.speechSynthesis.getVoices();
let loop;
let route;
let phrases;
let progress;
const NAV_WALKING_SPEED = 2;
const NAV_MINECART_SPEED = 8;
function startNavigation(inRoute) {
    var _a, _b, _c, _d, _e, _f;
    inRoute = inRoute !== null && inRoute !== void 0 ? inRoute : ['WN43', 'WN44', 'WN45', 'A56', 'A55', 'A53'];
    route = inRoute;
    phrases = [];
    progress = 0;
    speakText("Starting navigation");
    let firstPlace = places.filter(x => x.id == inRoute[0])[0];
    let secondPlace = places.filter(x => x.id == inRoute[1])[0];
    let firstRoute = routes.filter(x => x.from == inRoute[0] && x.to == inRoute[1])[0];
    if ((firstRoute === null || firstRoute === void 0 ? void 0 : firstRoute.mode) == "MRT") {
        let firstProvider = providers.filter(x => x.name == (firstRoute === null || firstRoute === void 0 ? void 0 : firstRoute.provider))[0];
        let direction = getDirection(firstPlace.x, firstPlace.z, secondPlace.x, secondPlace.z);
        if (direction)
            direction += "bound";
        speakText("Proceed to " + firstPlace.id + ", " + ((_a = firstPlace.displayName) !== null && _a !== void 0 ? _a : firstPlace.longName));
        phrases.push({
            place: firstPlace.id,
            distance: 500,
            spoken: false,
            phrase: "Take the " +
                ((_c = (_b = firstProvider.displayName) !== null && _b !== void 0 ? _b : firstProvider.name) !== null && _c !== void 0 ? _c : "") + ", " +
                (direction !== null && direction !== void 0 ? direction : "") + " towards " + secondPlace.id + ", " +
                ((_e = (_d = secondPlace.displayName) !== null && _d !== void 0 ? _d : secondPlace.longName) !== null && _e !== void 0 ? _e : "")
        });
    }
    else {
        speakText("Proceed to " + firstPlace.id + ", " + ((_f = firstPlace.displayName) !== null && _f !== void 0 ? _f : firstPlace.longName));
    }
    route.forEach((placeId, i) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        if (i + 1 == route.length) {
            let place = places.filter(x => x.id == placeId)[0];
            if (place.type == "MRT" && route[i - 1].substr(0, 1) == route[i].substr(0, 1)) {
                //phrases for reaching the end of a route via MRT
                phrases.push({
                    place: place.id,
                    distance: 1000,
                    spoken: false,
                    phrase: "In two minutes, you will reach your destination"
                });
                phrases.push({
                    place: place.id,
                    distance: 300,
                    spoken: false,
                    phrase: "At the next stop, you will reach your destination"
                });
                phrases.push({
                    place: place.id,
                    distance: 50,
                    spoken: false,
                    phrase: "You have reached your destination, " + place.id + ", " + ((_b = (_a = place.displayName) !== null && _a !== void 0 ? _a : place.longName) !== null && _b !== void 0 ? _b : "")
                });
            }
            //flight and walk endings are generated during the second to last place
            console.log("DEST");
            return;
        }
        let possibleRoutes = routes.filter(x => x.from == placeId && x.to == route[i + 1]);
        possibleRoutes = possibleRoutes.filter(x => allowedModes.includes(x.mode));
        let from = places.filter(x => x.id == placeId)[0];
        let to = places.filter(x => x.id == route[i + 1])[0];
        if (possibleRoutes.length == 0) {
            if (from.type == "MRT" && to.type == "MRT") {
                if (i == 0)
                    console.log("First!");
                if (route[i + 2] == undefined && route[i + 1].substr(0, 1) != route[i].substr(0, 1)) {
                    let phrase = "transfer to your destination.";
                    phrases.push({
                        place: from.id,
                        distance: 1000,
                        spoken: false,
                        phrase: "In two minutes, " + phrase
                    });
                    phrases.push({
                        place: from.id,
                        distance: 300,
                        spoken: false,
                        phrase: "At the next stop, " + phrase
                    });
                    phrases.push({
                        place: from.id,
                        distance: 50,
                        spoken: false,
                        phrase: phrase
                    });
                    return;
                }
                let nextRoute = routes.filter(x => x.from == to.id && x.to == route[i + 2])[0];
                let nextPlace = places.filter(x => x.id == route[i + 2])[0];
                if (nextRoute == undefined) {
                    console.log(from, to);
                    return;
                }
                let transferToProvider = providers.filter(x => x.name == nextRoute.provider)[0];
                let direction = getDirection(to.x, to.z, nextPlace.x, nextPlace.z);
                if (direction)
                    direction += "bound";
                let phrase = "transfer to the " + (direction !== null && direction !== void 0 ? direction : "") + " " +
                    ((_c = transferToProvider.displayName) !== null && _c !== void 0 ? _c : transferToProvider.name) +
                    ", towards " + nextPlace.id + ", " + ((_e = (_d = nextPlace.displayName) !== null && _d !== void 0 ? _d : nextPlace.longName) !== null && _e !== void 0 ? _e : "");
                phrases.push({
                    place: from.id,
                    distance: 1000,
                    spoken: false,
                    phrase: "In two minutes, " + phrase
                });
                phrases.push({
                    place: from.id,
                    distance: 300,
                    spoken: false,
                    phrase: "At the next stop, " + phrase
                });
                phrases.push({
                    place: from.id,
                    distance: 50,
                    spoken: false,
                    phrase: phrase
                });
                console.log("transfer", from, to);
                return;
            }
            if (from.type == "MRT" && to.type == "airport") {
                let nextRoutes = routes.filter(x => x.from == to.id && x.to == route[i + 2]);
                let nextPlace = places.filter(x => x.id == route[i + 2])[0];
                let then = "";
                if (nextRoutes.length > 0) {
                    if (nextRoutes.length == 1) {
                        let nextRoute = nextRoutes[0];
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
                            codeshare = (_f = codeshares === null || codeshares === void 0 ? void 0 : codeshares[nextRoute.provider]) === null || _f === void 0 ? void 0 : _f[nextRoute.number];
                        then = ", then take " + (codeshare !== null && codeshare !== void 0 ? codeshare : nextRoute.provider) + ", "
                            + blurbPrefix + " " + nextRoute.number + ", to " + ((_g = nextPlace.shortName) !== null && _g !== void 0 ? _g : "") + ", "
                            + ((_j = (_h = nextPlace.displayName) !== null && _h !== void 0 ? _h : nextPlace.longName) !== null && _j !== void 0 ? _j : "");
                        console.log("NEXTROUTE", nextRoute);
                        if (nextRoute.fromGate != undefined && nextRoute.fromGate != "") {
                            then += ", at Gate " + nextRoute.fromGate;
                        }
                        console.log("THEN", then);
                    }
                    else {
                        then = ", then take a flight to " + ((_k = nextPlace.shortName) !== null && _k !== void 0 ? _k : "") + ", "
                            + ((_m = (_l = nextPlace.displayName) !== null && _l !== void 0 ? _l : nextPlace.longName) !== null && _m !== void 0 ? _m : "")
                            + ". You have multiple flight options. ";
                        nextRoutes.forEach((flight, i) => {
                            var _a;
                            if (i == nextRoutes.length - 1) {
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
                            then += (codeshare !== null && codeshare !== void 0 ? codeshare : flight.provider) + ", " + blurbPrefix + " " + flight.number;
                            console.log("MULTIFLIGHT", flight);
                            if (flight.fromGate != undefined && flight.fromGate != "") {
                                then += ", at Gate " + flight.fromGate;
                            }
                            then += "... ";
                            //done
                        });
                    }
                    console.log(from, to);
                }
                let phrase = "walk to " + ((_o = to.shortName) !== null && _o !== void 0 ? _o : "") + ", " + ((_p = to.displayName) !== null && _p !== void 0 ? _p : to.longName);
                phrases.push({
                    place: from.id,
                    distance: 1000,
                    spoken: false,
                    phrase: "In two minutes, " + phrase + then
                });
                phrases.push({
                    place: from.id,
                    distance: 300,
                    spoken: false,
                    phrase: "At the next stop, " + phrase
                });
                phrases.push({
                    place: from.id,
                    distance: 50,
                    spoken: false,
                    phrase: phrase + then
                });
                return;
            }
            console.log("walk", from, to, undefined);
            return;
        }
        else {
            //possibleRoutes
            if (from.type == "airport" && to.type == "airport") {
                let nextRoutes = routes.filter(x => x.from == to.id && x.to == route[i + 2]);
                let nextPlace = places.filter(x => x.id == route[i + 2])[0];
                let then = "";
                if (nextRoutes.length > 0) {
                    if (nextRoutes.length == 1) {
                        let nextRoute = nextRoutes[0];
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
                            codeshare = (_q = codeshares === null || codeshares === void 0 ? void 0 : codeshares[nextRoute.provider]) === null || _q === void 0 ? void 0 : _q[nextRoute.number];
                        then = "take " + (codeshare !== null && codeshare !== void 0 ? codeshare : nextRoute.provider) + ", "
                            + blurbPrefix + " " + nextRoute.number + ", to " + ((_r = nextPlace.shortName) !== null && _r !== void 0 ? _r : "") + ", "
                            + ((_t = (_s = nextPlace.displayName) !== null && _s !== void 0 ? _s : nextPlace.longName) !== null && _t !== void 0 ? _t : "");
                        console.log("NEXTROUTE", nextRoute);
                        if (nextRoute.fromGate != undefined && nextRoute.fromGate != "") {
                            then += ", at Gate " + nextRoute.fromGate;
                        }
                        console.log("THEN", then);
                    }
                    else {
                        then = "take a flight to " + ((_u = nextPlace.shortName) !== null && _u !== void 0 ? _u : "") + ", "
                            + ((_w = (_v = nextPlace.displayName) !== null && _v !== void 0 ? _v : nextPlace.longName) !== null && _w !== void 0 ? _w : "")
                            + ". You have multiple flight options. ";
                        nextRoutes.forEach((flight, i) => {
                            var _a;
                            if (i == nextRoutes.length - 1) {
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
                            then += (codeshare !== null && codeshare !== void 0 ? codeshare : flight.provider) + ", " + blurbPrefix + " " + flight.number;
                            console.log("MULTIFLIGHT", flight);
                            if (flight.fromGate != undefined && flight.fromGate != "") {
                                then += ", at Gate " + flight.fromGate;
                            }
                            then += "... ";
                            //done
                        });
                    }
                    console.log(from, to);
                }
                let phrase = "Welcome to " + ((_y = (_x = to.displayName) !== null && _x !== void 0 ? _x : to.longName) !== null && _y !== void 0 ? _y : to.shortName) + "... ";
                phrases.push({
                    place: from.id,
                    distance: -1,
                    spoken: false,
                    phrase: phrase + then
                });
                console.log("flight");
            }
        }
    });
    console.log("START");
    navigationLoop();
    loop = setInterval(navigationLoop, 5000);
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
    voices = voices.filter(x => x.name.toLowerCase().indexOf("english") != -1);
    console.log(voices);
    var msg = new SpeechSynthesisUtterance();
    msg.voice = voices[6];
    msg.volume = 1; // 0 to 1
    msg.rate = 1; // 0.1 to 10
    msg.pitch = 1; //0 to 2
    msg.text = text;
    msg.lang = 'en-US';
    msg.onend = function (e) {
        console.log('Speak Finished in ' + e.elapsedTime + ' mseconds.');
        isSpeaking = false;
        speakQueue.shift();
        clearInterval(speakInterval);
        triggerSpeakQueue();
    };
    msg.onstart = function (e) {
        isSpeaking = true;
        console.log('Speak Started in ' + e.elapsedTime + ' mseconds.');
    };
    msg.onerror = function (event) {
        console.log('Speak An error has occurred with the speech synthesis: ' + event.error);
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
    let direction = Math.atan2(x, z) / Math.PI * 180;
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
    fetch(`https://thingproxy.freeboard.io/fetch/https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json`)
        .then(response => {
        return response.json();
    }).then(res => {
        let data = res;
        let player = data.players.filter((x) => x.name == "Scarycrumb45")[0];
        if (player == undefined) {
            console.log("Player not found");
            return;
        }
        //tODO wait for player
        // let routePlaces = places.filter(x => route.includes(x.id))
        // let closestPlace = routePlaces[0]
        // let timeToClosest = Infinity;
        //
        // routePlaces.forEach(place => {
        //   let oldTime = getDistance(closestPlace.x ?? 999999, closestPlace.z ?? 999999, player.x, player.z)
        //   let newTime = getDistance(place.x ?? 999999, place.z ?? 999999, player.x, player.z)
        //
        //   if (newTime < oldTime) {
        //     console.log("CLOSER " + place.id)
        //     closestPlace = place
        //     timeToClosest = newTime
        //   }
        // })
        let phraseCount = 0;
        let shouldSkip = false;
        phrases.forEach(phrase => {
            if (shouldSkip)
                return;
            let place = places.filter(x => x.id == phrase.place)[0];
            if (phrase.distance == -1) {
                if (lastPlayer == undefined)
                    return;
                let distanceMoved = getDistance(player.x, player.z, lastPlayer.x, lastPlayer.z);
                if (distanceMoved > 2000) {
                    console.log("MOVED A LOT, TRIGGERING PHRASE");
                    if (place.x == undefined || place.z == undefined) {
                        console.log("location not defined");
                        speakText(phrase.phrase);
                        phrase.spoken = true;
                        shouldSkip = true;
                    }
                    else {
                        console.log("location defined");
                        let distance = getDistance(player.x, player.z, place.x, place.z);
                        console.log(distance);
                        if (distance < 2000) {
                            speakText(phrase.phrase);
                            phrase.spoken = true;
                            shouldSkip = true;
                        }
                    }
                }
            }
            else {
                if (place.x == undefined || place.z == undefined)
                    return;
                let distance = getDistance(player.x, player.z, place.x, place.z);
                if (distance < phrase.distance && phrase.spoken == false) {
                    speakText(phrase.phrase);
                    phrase.spoken = true;
                    shouldSkip = true;
                }
            }
            if (phrase.spoken == false)
                shouldSkip = true;
            if (phrase.spoken)
                phraseCount++;
        });
        if (phraseCount == phrases.length) {
            speakText("Navigation complete");
            clearInterval(loop);
        }
        // console.log(closestPlace)
        // readText("Closest place is " + closestPlace.id + ", " + (closestPlace.displayName ?? closestPlace.longName ?? ""))
        lastPlayer = player;
    });
}
//# sourceMappingURL=navigate.js.map