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
let cancelCode = 0;
let localSpawnWarps = [];
let resultsCache = {};
onmessage = function (e) {
    var _a, _b;
    console.log("MESSAGE RECIEVED");
    let data = e.data;
    let code = data.shift();
    if (code == "calc") {
        if (((_b = (_a = resultsCache[data[0]]) === null || _a === void 0 ? void 0 : _a[data[1]]) === null || _b === void 0 ? void 0 : _b[data[2].toString()]) != undefined) {
            console.log("Sending success from cache");
            sendSuccess(resultsCache[data[0]][data[1]][data[2].toString()], data[2], data[0], data[1]);
            return;
        }
        cancelCode++;
        calculateRoute(data[0], data[1], cancelCode, data[2]);
    }
    if (code == "genTimeMaps") {
        workerGenerateTimeMaps(data[0], data[1]);
        if (Array.isArray(localSpawnWarps))
            localSpawnWarps = data[2];
    }
};
const WALKING_SPEED = 2;
const MINECART_SPEED = 8;
const EXTRA_TIME = 10;
let localPlaces;
let localRoutes;
function sortedIndex(array, value) {
    var low = 0, high = array.length;
    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid].time < value)
            low = mid + 1;
        else
            high = mid;
    }
    return low;
}
let timesMap = undefined;
function workerGenerateTimeMaps(routesParam, placesParam) {
    localRoutes = routesParam;
    localPlaces = placesParam;
    timesMap = {
        walk: {},
        MRT: {},
        flight: {},
        heli: {},
        seaplane: {},
        spawnWarp: {}, //shouldn't ever be defined
    };
    for (let i in localPlaces) {
        for (let j in localPlaces) {
            let a = localPlaces[i];
            let b = localPlaces[j];
            if (timesMap["walk"][a.id] == undefined)
                timesMap["walk"][a.id] = {};
            if (a.x && a.z && b.x && b.z && a.id != b.id) {
                timesMap["walk"][a.id][b.id] = getTravelTime(a.x, a.z, b.x, b.z, "walk");
            }
            else {
                timesMap["walk"][a.id][b.id] = Infinity;
            }
        }
    }
    localRoutes.forEach((route) => {
        if ((timesMap === null || timesMap === void 0 ? void 0 : timesMap[route.mode][route.from]) == undefined)
            timesMap[route.mode][route.from] = {};
        let time = routeTime(route);
        timesMap[route.mode][route.from][route.to] = time;
    });
    let msg = "genTimeMaps";
    postMessage([msg]);
}
function getTravelTime(x1, y1, x2, y2, mode) {
    let y = x2 - x1;
    let x = y2 - y1;
    let distance = Math.ceil(Math.sqrt(x * x + y * y));
    if (mode == "walk") {
        // add 10 ensures that it will always be faster to walk in a straight line
        return distance / WALKING_SPEED + 10;
    }
    else if (mode == "MRT") {
        return distance / MINECART_SPEED;
    }
    else {
        //should never be used really
        return 60 * 5;
    }
}
function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2 + y1 - y2);
}
function routeTime(route) {
    if (route.mode == "flight" ||
        route.mode == "seaplane" ||
        route.mode == "heli") {
        let time = 60 * 5;
        if (route.fromGate == undefined)
            time += 2;
        if (route.toGate == undefined)
            time += 1;
        return time;
    }
    let from = localPlaces.filter((x) => x.id == route.from)[0];
    let to = localPlaces.filter((x) => x.id == route.to)[0];
    if (from == undefined || to == undefined)
        return Infinity;
    if (from.x == undefined || from.z == undefined)
        return Infinity;
    if (to.x == undefined || to.z == undefined)
        return Infinity;
    if (route.mode == "MRT")
        return getTravelTime(from.x, from.z, to.x, to.z, "MRT");
    else
        return 60 * 5; //TODO CHANGE
}
function getNeighbors(currentNode, currentTime, allowedModes) {
    let nearestNodes = {};
    currentTime = parseFloat(currentTime);
    if (timesMap == undefined) {
        let msg = "timeMapsNeeded";
        postMessage([msg]);
        return undefined;
    }
    allowedModes.forEach((mode) => {
        var _a;
        let currentMap = (_a = timesMap === null || timesMap === void 0 ? void 0 : timesMap[mode]) === null || _a === void 0 ? void 0 : _a[currentNode];
        for (let place in currentMap) {
            if (nearestNodes[place] == undefined) {
                nearestNodes[place] = currentMap[place];
            }
            else {
                nearestNodes[place] = Math.min(currentMap[place], nearestNodes[place]);
            }
        }
    });
    for (let i in nearestNodes) {
        nearestNodes[i] += currentTime;
    }
    return nearestNodes;
}
function calculateRoute(startNode, endNode, localCancelCode, allowedModes) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        if (startNode.substr(0, 1) == "#") {
            let coords = startNode.substring(1, startNode.length).split("+");
            timesMap["walk"][startNode] = {};
            for (let i in localPlaces) {
                let place = localPlaces[i];
                if (place.z != undefined && place.x != undefined) {
                    timesMap["walk"][place.id][startNode] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk");
                    timesMap["walk"][startNode][place.id] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk");
                }
            }
        }
        if (endNode.substr(0, 1) == "#") {
            let coords = endNode.substring(1, startNode.length).split("+");
            timesMap["walk"][endNode] = {};
            for (let i in localPlaces) {
                let place = localPlaces[i];
                if (place.z != undefined && place.x != undefined) {
                    timesMap["walk"][place.id][endNode] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk");
                    timesMap["walk"][endNode][place.id] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk");
                }
            }
        }
        var startTime = performance.now();
        console.log("FINDING", startNode, endNode, localCancelCode);
        let visited = { [startNode]: 0 }; //visited
        let knownMinTimes = { [startNode]: 0 };
        let nodeHeap = []; //path heap
        let parents = {};
        let finishTime = Infinity;
        //get max value
        let maxTime = Infinity;
        try {
            maxTime = (_a = timesMap === null || timesMap === void 0 ? void 0 : timesMap["walk"][startNode][endNode]) !== null && _a !== void 0 ? _a : Infinity;
        }
        catch (_g) {
            sendFailure();
            throw new Error("Places not defined");
        }
        parents = {
            [endNode]: {
                time: maxTime,
                parents: [startNode],
            },
        };
        // get starting values
        let startingValues = getNeighbors(startNode, 0, allowedModes);
        if (startingValues == undefined)
            return;
        // map them into the path heap
        for (let i in startingValues) {
            if (startingValues[i] < maxTime && startingValues[i] != Infinity) {
                parents[i] = {
                    time: startingValues[i],
                    parents: [startNode],
                };
                nodeHeap.push({
                    name: i,
                    time: startingValues[i],
                });
            }
        }
        if (allowedModes.includes("spawnWarp")) {
            localSpawnWarps.forEach((warp) => {
                nodeHeap.push({
                    name: warp,
                    time: 2 * 60,
                });
                parents[warp] = {
                    time: 2 * 60,
                    parents: [startNode],
                };
            });
        }
        //prevent early exit because of blank nodes
        if (nodeHeap.length == 1)
            nodeHeap = [nodeHeap[0], nodeHeap[0]];
        // sort the heap
        nodeHeap.sort((a, b) => (a.time > b.time ? 1 : -1));
        //get starting path and node
        let currentNode = nodeHeap[0];
        let pauseCounter = 0;
        function doneSearching() {
            if (parents[endNode].time == Infinity) {
                postMessage(["failed"]);
                return;
            }
            let paths = [[endNode]];
            let doneCounter = 0;
            for (let i = 0; i < 10000; i++) {
                if (doneCounter > paths.length) {
                    i = 100000;
                }
                if (paths[0][0] == startNode) {
                    paths.push(paths.shift());
                    doneCounter++;
                    continue;
                }
                doneCounter = 0;
                let currentPath = paths.shift();
                if (currentPath == undefined)
                    continue;
                let currentParents = parents[currentPath[0]].parents;
                currentParents.forEach((node) => {
                    paths.push([node, ...currentPath]);
                });
            }
            sendSuccess(paths, allowedModes, startNode, endNode);
            return;
        }
        //while searching
        while (currentNode && nodeHeap.length > 0) {
            if (pauseCounter > 100) {
                pauseCounter = 0;
                yield new Promise((resolve) => {
                    setTimeout(resolve, 1);
                });
            }
            pauseCounter++;
            if (localCancelCode < cancelCode) {
                return;
            }
            // for the shortest path in Paths
            currentNode = (_b = nodeHeap.shift()) !== null && _b !== void 0 ? _b : nodeHeap[0];
            if (currentNode == undefined)
                continue;
            let currentTime = currentNode.time;
            let status = "report";
            postMessage([status, currentTime, maxTime]);
            // if we've reached the last node we're done
            if (currentNode.name == endNode) {
                finishTime = currentTime;
            }
            //allow for multiple solutions
            if (currentTime > finishTime + EXTRA_TIME || nodeHeap.length == 0) {
                console.log("DONE SEARCHING", parents);
                var endTime = performance.now();
                console.log("Took", endTime - startTime);
                let status = "report";
                postMessage([status, currentTime, currentTime]);
                doneSearching();
                return;
            }
            //if the route is already failing, stop
            if (currentNode.name in visited && currentTime >= visited[currentNode.name])
                continue;
            if (currentTime > maxTime + EXTRA_TIME)
                continue;
            // update Max Value
            let newMax = currentTime +
                ((_e = (_d = (_c = timesMap === null || timesMap === void 0 ? void 0 : timesMap["walk"]) === null || _c === void 0 ? void 0 : _c[currentNode.name]) === null || _d === void 0 ? void 0 : _d[endNode]) !== null && _e !== void 0 ? _e : Infinity);
            if (newMax < maxTime) {
                maxTime = newMax;
                //let indexToCut = sortedIndex(heap, maxTime * 1.5)
                //heap = heap.slice(0, indexToCut)
                nodeHeap = nodeHeap.filter((x) => x.time <= maxTime + EXTRA_TIME);
            }
            // take the last node of path and generate all possible next steps
            let nextSteps = getNeighbors(currentNode.name, currentTime, allowedModes);
            for (let nextNode in nextSteps) {
                if (nextNode == startNode)
                    continue;
                let nextTime = nextSteps[nextNode];
                // discard any that are longer than max time
                // console.log("discarding too long node  ", nextNode)
                if (nextTime > maxTime + EXTRA_TIME)
                    continue;
                //don't include Infinity
                if (nextTime == Infinity)
                    continue;
                //don't revisit nodes unless distance is same
                if (nextNode in visited) {
                    if (visited[nextNode] + EXTRA_TIME < currentTime) {
                        // console.log("discarding visited node  ", nextNode)
                        continue;
                    }
                }
                //console.log(nextNode, nextTime, maxTime, nodeHeap.length)
                //also check known times
                if (knownMinTimes[nextNode] == undefined ||
                    nextTime <= knownMinTimes[nextNode]) {
                    knownMinTimes[nextNode] = nextTime;
                    // console.log("shortest time found for ", nextNode)
                }
                else if (nextTime > knownMinTimes[nextNode] + EXTRA_TIME) {
                    // console.log("node longer than shortest known time ", nextNode, knownMinTimes[nextNode], nextTime)
                    continue;
                }
                // console.log("adding ", nextNode);
                //take note of parents
                if (parents[nextNode] == undefined) {
                    // console.log("creating parent for ", currentNode, nextNode)
                    parents[nextNode] = {
                        time: nextTime,
                        parents: [currentNode.name],
                    };
                }
                else {
                    let fastestTime = parents[nextNode].time;
                    if (nextTime + EXTRA_TIME < fastestTime) {
                        // console.log("shorter parent found for ", currentNode, nextNode, nextTime, fastestTime)
                        parents[nextNode] = {
                            parents: [currentNode.name],
                            time: nextTime,
                        };
                    }
                    else if (nextTime < fastestTime + EXTRA_TIME) {
                        if (!parents[nextNode].parents.includes(currentNode.name)) {
                            parents[nextNode].parents.push(currentNode.name);
                            // console.log("equal parent found for ", currentNode, nextNode, nextTime)
                        }
                    }
                }
                // console.log("queueing new node ", nextNode)
                // add them to the stack in order of quickness
                let newNode = {
                    name: nextNode,
                    time: nextTime,
                };
                let indexToAddAt = sortedIndex(nodeHeap, nextTime);
                nodeHeap.splice(indexToAddAt, 0, newNode);
            }
            //mark current node as visited
            visited[currentNode.name] = currentTime;
        }
        if (((_f = parents[endNode]) === null || _f === void 0 ? void 0 : _f.time) < Infinity) {
            doneSearching();
            return;
        }
        console.log("EXITED");
        sendFailure();
    });
}
function sumArray(array, allowedModes) {
    let totalDistance = 0;
    array.forEach((place, i) => {
        var _a, _b;
        if (i == 0)
            return;
        totalDistance =
            (_b = (_a = getNeighbors(array[i - 1], totalDistance, allowedModes)) === null || _a === void 0 ? void 0 : _a[place]) !== null && _b !== void 0 ? _b : 0;
    });
    return totalDistance;
}
function sortResults(results, allowedModes) {
    return results.sort((a, b) => {
        return sumArray(a, allowedModes) > sumArray(b, allowedModes) ? 1 : -1;
    });
}
function sendSuccess(dataToSend, allowedModes, from, to) {
    dataToSend = sortResults(dataToSend, allowedModes);
    console.log(dataToSend.map((x) => sumArray(x, allowedModes)));
    console.log("SENDING SUCCESS MESSAGE", dataToSend);
    if (resultsCache[from] == undefined) {
        resultsCache[from] = {};
    }
    if (resultsCache[from][to] == undefined) {
        resultsCache[from][to] = {};
    }
    resultsCache[from][to][allowedModes.toString()] = dataToSend;
    let message = "complete";
    postMessage([message, dataToSend]);
}
function sendFailure() {
    let message = "failed";
    postMessage([message]);
}
//# sourceMappingURL=worker.js.map