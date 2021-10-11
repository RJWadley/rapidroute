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
function findShortestPath(startNode, endNode, allowedModes, dataCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let hasGen = false;
            calculationWorker.postMessage(["calc", startNode, endNode, allowedModes]);
            calculationWorker.onmessage = function (e) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("MESSAGE FROM WORKER", e.data);
                    let code = e.data[0];
                    if (code == "complete") {
                        console.log("COMPLETE");
                        $("#searching").css("display", "none");
                        resolve(e.data[1]);
                    }
                    if (code == "report") {
                        e.data.shift();
                        dataCallback(e.data);
                    }
                    if (code == "failed") {
                        $("#searching").css("display", "none");
                        $("#progress-bar").fadeOut();
                        $("#results").append("<div class='route'>No routes found</div>");
                        reject();
                    }
                    if (code == "timeMapsNeeded") {
                        console.log("REQUEST FOR GEN RECIEVED");
                        if (hasGen == false) {
                            hasGen = true;
                            yield generateTimeMaps(routes, places);
                            console.log("GEN COMPLETE");
                            findShortestPath(startNode, endNode, allowedModes, dataCallback).then(resolve);
                        }
                        else {
                            console.log("REQUEST FOR GEN RECIEVED TWICE, FAILING");
                            $("#searching").css("display", "none");
                            reject();
                        }
                    }
                });
            };
        }));
    });
}
function generateTimeMaps(routes, places) {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        calculationWorker.postMessage(["genTimeMaps", routes, places]);
        calculationWorker.onmessage = function (e) {
            let code = e.data[0];
            if (code == "genTimeMaps")
                resolve(true);
        };
    }));
}
if (window.Worker) {
    var calculationWorker = new Worker('./dist/worker.js');
}
let allowedModes = [];
function startSearch() {
    var _a, _b;
    allowedModes = ["walk"];
    $(".checkbox").each(function () {
        let mode = $(this).attr("data-mode");
        let checked = $(this).is(":checked");
        if (checked) {
            allowedModes.push(mode);
        }
    });
    if ($(".menu").hasClass("menuIsVisible")) {
        return;
    }
    console.log("ALLOWED MODES", allowedModes);
    if (allowedModes.length == 0) {
        return;
    }
    let from = (_a = $("#from").attr("data")) !== null && _a !== void 0 ? _a : "";
    let to = (_b = $("#to").attr("data")) !== null && _b !== void 0 ? _b : "";
    if (from != "" && to != "") {
        console.log("starting search");
        $("#results").html("");
        $("#searching").fadeIn();
        $("#progress-bar").fadeIn();
        findShortestPath(from, to, allowedModes, function (data) {
            let progress = Math.round(data[0] / data[1] * 100);
            console.log("progress ", progress);
            $("#progress-bar").css("transform", "scaleX(" + progress * 2 + ")");
        }).then(populateResults);
    }
}
function deTransferIfy(results) {
    results = results.sort((a, b) => {
        let intersectionA = a.filter(x => !b.includes(x));
        let intersectionB = b.filter(x => !a.includes(x));
        return intersectionA[0] < intersectionB[0] ? 1 : -1;
    });
    for (let i = 0; i < results.length - 1; i++) {
        let a = results[i];
        let b = results[i + 1];
        let intersectionA = a.filter(x => !b.includes(x));
        let intersectionB = b.filter(x => !a.includes(x));
        if (intersectionA.length == 1 && intersectionB.length == 1) {
            console.log("difference is same length", i);
            if (a.indexOf(intersectionA[0]) == b.indexOf(intersectionB[0])) {
                console.log("difference is in same spot", i);
                results.splice(i, 1);
                i--;
            }
        }
    }
    return results;
}
function populateResults(results) {
    $("#progress-bar").css("transform", "scaleX(200)");
    setTimeout(function () {
        $("#progress-bar").fadeOut(500);
        setTimeout(function () {
            $("#progress-bar").css("transform", "scaleX(1)");
        }, 500);
    }, 500);
    results = deTransferIfy(results);
    results = deTransferIfy(results);
    if (results.length == 0) {
        $("#results").append("<div class='route'>Something went wrong</div>");
    }
    results.forEach((result, i) => {
        let resultElem = $("<div class='route'>Option " + (i + 1) + "</div>");
        //add to dom
        let mrtPassAlong = undefined;
        result.forEach((placeId, j) => {
            var _a, _b;
            if (j + 2 > result.length)
                return;
            let possibleRoutes = routes.filter(x => x.from == placeId && x.to == result[j + 1]);
            console.log(possibleRoutes);
            possibleRoutes = possibleRoutes.filter(x => allowedModes.includes(x.mode));
            console.log(possibleRoutes);
            let from = places.filter(x => x.id == placeId)[0];
            let to = places.filter(x => x.id == result[j + 1])[0];
            if (possibleRoutes.length == 0) {
                if (from.type == "MRT" && to.type == "MRT") {
                    resultElem.append(render("transfer", from, to, undefined));
                    return;
                }
                resultElem.append(render("walk", from, to, undefined));
                return;
            }
            // collapse MRT routes
            let nextPossibleRoutes = routes.filter(x => x.from == result[j + 1] && x.to == result[j + 2]);
            if (((_a = possibleRoutes[0]) === null || _a === void 0 ? void 0 : _a.mode) == "MRT" && ((_b = nextPossibleRoutes[0]) === null || _b === void 0 ? void 0 : _b.mode) == "MRT") {
                if (placeId.charAt(0) == result[j + 2].charAt(0)) {
                    if (mrtPassAlong == undefined)
                        mrtPassAlong = placeId;
                    return;
                }
            }
            if (mrtPassAlong != undefined) {
                let route = possibleRoutes[0];
                from = places.filter(x => x.id == mrtPassAlong)[0];
                resultElem.append(render("MRT", from, to, route));
                mrtPassAlong = undefined;
                return;
            }
            if (possibleRoutes[0].mode == "MRT") {
                let route = possibleRoutes[0];
                resultElem.append(render("MRT", from, to, route));
                return;
            }
            if (possibleRoutes.length == 1) {
                let route = possibleRoutes[0];
                if (route == undefined || from == undefined || to == undefined)
                    throw new Error("Cannot render flight");
                resultElem.append(render("largeFlight", from, to, route).prop('outerHTML'));
                return;
            }
            resultElem.append(render("flightHeader", from, to, undefined));
            possibleRoutes.forEach(flight => {
                resultElem.children().last().append(render("smallFlight", from, to, flight));
            });
        });
        $("#results").append(resultElem);
    });
}
function render(type, from, to, route) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
    let currentDiv = $("<div class='leg'></div>");
    if (type == "largeFlight") {
        if (route == undefined)
            throw new Error("Route not defined");
        //get blurb
        let blurbPrefix;
        switch (route.mode) {
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
                blurbPrefix = "By";
        }
        if (route.provider == undefined) {
            throw new Error("No provider specified");
        }
        //codeshared flights
        let codeshare;
        if (route.number != undefined)
            codeshare = (_a = codeshares === null || codeshares === void 0 ? void 0 : codeshares[route.provider]) === null || _a === void 0 ? void 0 : _a[route.number];
        let logo = logos[codeshare !== null && codeshare !== void 0 ? codeshare : route.provider];
        if (logo)
            logo = `<img src="${logo}"/>`;
        //change stuff if we don't have an image
        let modifiedStyle;
        if (!logo)
            modifiedStyle = "style='display:block'";
        //set color
        let color = colors[codeshare !== null && codeshare !== void 0 ? codeshare : route.provider];
        currentDiv.css("background-color", color !== null && color !== void 0 ? color : "");
        currentDiv.append(`
      <div class="leg-blurb">
        ${blurbPrefix} ${route.number} by ${codeshare !== null && codeshare !== void 0 ? codeshare : route.provider}
      </div>
      <div class="leg-middle" ${modifiedStyle}>
        ${logo}
        <div class="leg-summary">
          <div class="leg-code">${(_b = from.shortName) !== null && _b !== void 0 ? _b : "—"}</div>
          <div class="leg-gate">
            <div>Gate:</div>
            <div>${(_c = route.fromGate) !== null && _c !== void 0 ? _c : "unk."}</div>
          </div>
          <div class="leg-arrow">-></div>
          <div class="leg-gate">
            <div>Gate:</div>
            <div>${(_d = route.toGate) !== null && _d !== void 0 ? _d : "unk."}</div>
          </div>
          <div class="leg-code">${(_e = to.shortName) !== null && _e !== void 0 ? _e : "—"}</div>
        </div>
      </div>
      <div class="leg-details">
        <div>${(_g = (_f = from.displayName) !== null && _f !== void 0 ? _f : from.longName) !== null && _g !== void 0 ? _g : "Foobar"}</div>
        <div>${(_j = (_h = to.displayName) !== null && _h !== void 0 ? _h : to.longName) !== null && _j !== void 0 ? _j : "Foobar"}</div>
      </div>
    `);
    }
    else if (type == "walk") {
        currentDiv.append(`
        <div class="leg-summary"><span class="material-icons">
directions_walk
</span>
          <div class="leg-code">Walk to ${(_k = to.shortName) !== null && _k !== void 0 ? _k : "--"}</div>
        </div>
        <div class="walk-details">
          <div></div>
          <div>${(_m = (_l = to.displayName) !== null && _l !== void 0 ? _l : to.longName) !== null && _m !== void 0 ? _m : "Foobar"}</div>
        </div>
      `);
    }
    else if (type == "MRT") {
        if (route == undefined)
            throw new Error("Route not defined");
        let color = colors[(_o = route.provider) !== null && _o !== void 0 ? _o : ""];
        currentDiv.css("background-color", color !== null && color !== void 0 ? color : "");
        let provider = providers.filter(x => x.name == route.provider)[0];
        currentDiv.append(`
        <div class="leg-blurb">
        By the ${(_p = provider.displayName) !== null && _p !== void 0 ? _p : provider.name}
        </div>
          <div class="leg-middle">
            <img style="
    mix-blend-mode: normal;
  " src="https://www.minecartrapidtransit.net/wp-content/uploads/2015/01/logo.png">
          <div class="leg-summary">
            <div class="leg-code">${from.shortName}</div>
            <div class="leg-arrow">-></div>
            <div class="leg-code">${to.shortName}</div>
          </div>
        </div>
        <div class="leg-details">
          <div>${(_r = (_q = from.displayName) !== null && _q !== void 0 ? _q : from.longName) !== null && _r !== void 0 ? _r : "Foobar"}</div>
          <div>${(_t = (_s = to.displayName) !== null && _s !== void 0 ? _s : to.longName) !== null && _t !== void 0 ? _t : "Foobar"}</div>
        </div>
      `);
    }
    else if (type == "transfer") {
        currentDiv.append(`
        <div class="leg-summary"><span class="material-icons">
transfer_within_a_station
</span>
          <div class="leg-code">Transfer to ${(_u = to.shortName) !== null && _u !== void 0 ? _u : "--"}</div>
        </div>
        <div class="walk-details">
          <div>${(_w = (_v = to.displayName) !== null && _v !== void 0 ? _v : to.longName) !== null && _w !== void 0 ? _w : "Foobar"}</div>
        </div>
      `);
    }
    else if (type == "flightHeader") {
        currentDiv.append(`
        <div class="leg-middle" style='display:block'>
          <div class="leg-summary">
            <div class="leg-code">${from.shortName}</div>
            <div class="leg-arrow">-></div>
            <div class="leg-code">${to.shortName}</div>
          </div>
        </div>
        <div class="leg-details">
          <div>${(_y = (_x = from.displayName) !== null && _x !== void 0 ? _x : from.longName) !== null && _y !== void 0 ? _y : "Foobar"}</div>
          <div>${(_0 = (_z = to.displayName) !== null && _z !== void 0 ? _z : to.longName) !== null && _0 !== void 0 ? _0 : "Foobar"}</div>
        </div>
        <div>
        <p>Flight offered by:</p>
        </div>
      `);
    }
    else if (type == "smallFlight") {
        if (route == undefined)
            throw new Error("Route not defined");
        if (route.provider == undefined)
            throw new Error("Provider not defined");
        currentDiv.removeClass("leg");
        //codeshared flights
        let codeshare;
        if (route.number != undefined)
            codeshare = (_1 = codeshares === null || codeshares === void 0 ? void 0 : codeshares[route.provider]) === null || _1 === void 0 ? void 0 : _1[route.number];
        let logo = logos[codeshare !== null && codeshare !== void 0 ? codeshare : route.provider];
        if (logo)
            logo = `<img src="${logo}"/>`;
        currentDiv.append(`
      <div class="multiflight">
        ${logo !== null && logo !== void 0 ? logo : ""}
        <div class="multiflight-provider">By ${codeshare !== null && codeshare !== void 0 ? codeshare : route.provider}</div>
        <div class="multiflight-from">${(_2 = route.fromGate) !== null && _2 !== void 0 ? _2 : "unk."}</div>
        <div class="multiflight-arrow">-></div>
        <div class="multiflight-to">${(_3 = route.toGate) !== null && _3 !== void 0 ? _3 : "unk."}</div>
      </div>
    `);
    }
    return currentDiv;
}
$(".checkbox").on("change", function () {
    startSearch();
});
//# sourceMappingURL=calc.js.map