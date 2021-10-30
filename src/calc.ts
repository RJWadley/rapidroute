type SWCode =
  | "calc"
  | "cancel"
  | "report"
  | "complete"
  | "exited"
  | "genTimeMaps"
  | "failed"
  | "timeMapsNeeded";
type renderTypes =
  | "flightHeader"
  | "largeFlight"
  | "smallFlight"
  | "MRT"
  | "walk"
  | "transfer"
  | "warp";

let approxRouteTime;

async function findShortestPath(
  startNode: string,
  endNode: string,
  allowedModes: Array<Mode>,
  dataCallback: Function
): Promise<Array<Array<string>>> {
  return new Promise(async (resolve, reject) => {
    let hasGen = false;
    calculationWorker.postMessage(["calc", startNode, endNode, allowedModes]);
    calculationWorker.onmessage = async function (e) {
      let code = e.data[0];
      if (code == "complete") {
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
        $("#results").append("<div class='no-routes'>No Routes Found</div>");
        reject();
      }
      if (code == "timeMapsNeeded") {
        if (hasGen == false) {
          hasGen = true;
          await generateTimeMaps(routes, places);
          findShortestPath(startNode, endNode, allowedModes, dataCallback).then(
            resolve
          );
        } else {
          $("#searching").css("display", "none");
          reject();
        }
      }
    };
  });
}

function generateTimeMaps(routes: Array<Route>, places: Array<Place>) {
  return new Promise(async (resolve) => {
    calculationWorker.postMessage(["genTimeMaps", routes, places, spawnWarps]);
    calculationWorker.onmessage = function (e) {
      let code = e.data[0];
      if (code == "genTimeMaps") resolve(true);
    };
  });
}

if (window.Worker) {
  var calculationWorker = new Worker("./dist/worker.js");
}

let allowedModes: Array<Mode> = [];

function startSearch() {
  allowedModes = ["walk"];
  $(".checkbox").each(function () {
    let mode = $(this).attr("data-mode") as Mode;
    let checked = $(this).is(":checked");
    if (checked) {
      allowedModes.push(mode);
    }
  });

  if ($(".menu").hasClass("menuIsVisible")) {
    return;
  }

  if (allowedModes.length == 0) {
    return;
  }

  let from = $("#from").attr("data-dest") ?? "";
  let to = $("#to").attr("data-dest") ?? "";

  if (from == to) {
    $("#results").html("");
    return;
  }

  if (from != "" && to != "") {
    //@ts-ignore
    if (typeof mixpanel != "undefined")
      //@ts-ignore
      mixpanel.track("Searched", { from: from, to: to });

    $("#results").html("");
    $("#searching").fadeIn();

    $("#progress-bar").fadeIn();
    findShortestPath(from, to, allowedModes, function (data: any) {
      if (data[0] == data[1]) approxRouteTime = data[0];
      let progress = Math.round((data[0] / data[1]) * 105);
      $("#progress-bar").css("transform", "scaleX(" + progress * 2 + ")");
    }).then(populateResults);
  }
}

function deTransferIfy(results: Array<Array<string>>): Array<Array<string>> {
  let hasBeenModified = false;

  //remove double transfers
  for (let i = 0; i < results.length; i++) {
    let currentResult = results[i];
    for (let j = 0; j + 2 < currentResult.length; j++) {
      // get this place and next 2
      let a = places.filter((x) => x.id == currentResult[j])[0];
      let b = places.filter((x) => x.id == currentResult[j + 1])[0];
      let c = places.filter((x) => x.id == currentResult[j + 2])[0];

      //get route between
      let routesA = routes.filter((x) => x.from == a.id && x.to == b.id);
      let routesB = routes.filter((x) => x.from == b.id && x.to == c.id);

      //remove if a double transfer or a double walk
      if (
        a.type == "MRT" &&
        b.type == "MRT" &&
        c.type == "MRT" &&
        routesA.length == 0 &&
        routesB.length == 0 &&
        !spawnWarps.includes(b.id)
      ) {
        results.splice(i, 1);
        i--;
        hasBeenModified = true;
      }
    }
  }

  //remove equivalent transfers
  let resultsCopy = [...results];
  resultsCopy = resultsCopy.sort((a, b) => {
    let differenceA = a.filter((x) => !b.includes(x));
    let differenceB = b.filter((x) => !a.includes(x));
    return differenceA[0] > differenceB[0] ? 1 : -1;
  });

  //check against neighors
  for (let i = resultsCopy.length - 1; i > 0; i--) {
    let a = resultsCopy[i];
    let b = resultsCopy[i - 1];

    let intersectionA = a.filter((x) => !b.includes(x));
    let intersectionB = b.filter((x) => !a.includes(x));

    if (intersectionA.length == 1 && intersectionB.length == 1) {
      if (a.indexOf(intersectionA[0]) == b.indexOf(intersectionB[0])) {
        let place = places.filter((x) => x.id == intersectionA[0])[0];

        if (place.type == "MRT") {
          for (let j = 0; j < results.length; j++) {
            //@ts-ignore ts doesn't recognize overload
            if (results[j].equals(resultsCopy[i])) {
              results.splice(i, 1);
              hasBeenModified = true;
            }
          }
        }
      }
    }
  }

  //check against second neighors (dupe code)
  for (let i = resultsCopy.length - 1; i > 1; i--) {
    let a = resultsCopy[i];
    let b = resultsCopy[i - 2];

    let intersectionA = a.filter((x) => !b.includes(x));
    let intersectionB = b.filter((x) => !a.includes(x));

    if (intersectionA.length == 1 && intersectionB.length == 1) {
      if (a.indexOf(intersectionA[0]) == b.indexOf(intersectionB[0])) {
        let place = places.filter((x) => x.id == intersectionA[0])[0];

        if (place.type == "MRT") {
          for (let j = 0; j < results.length; j++) {
            //@ts-ignore ts doesn't recognize overload
            if (results[j].equals(resultsCopy[i])) {
              results.splice(i, 1);
              hasBeenModified = true;
            }
          }
        }
      }
    }
  }

  if (hasBeenModified) {
    return deTransferIfy(results);
  }

  return results;
}

function populateResults(results: Array<Array<string>>) {
  $("#progress-bar").css("transform", "scaleX(210)");
  setTimeout(function () {
    $("#progress-bar").fadeOut(500);
    setTimeout(function () {
      $("#progress-bar").css("transform", "scaleX(1)");
    }, 500);
  }, 500);

  results = deTransferIfy(results);

  $("#results").html("<div tabindex=0 class='toggle-all'>Toggle All</div>");
  if (results.length == 0) {
    $("#results").append("<div class='route'>Something went wrong</div>");
  }

  let differences = calcDifferences(results);

  results.forEach((result, i) => {
    let resultElem = $(
      `<div class='route'>
        <div class="route-header" tabindex="0">
        Via ${differences[i].join(", ")}
        <span class="material-icons">
          expand_more
        </span>
        </div>
      </div>`
    );
    //add to dom

    let mrtPassAlong: string | undefined = undefined;
    result.forEach((placeId, j) => {
      if (j + 2 > result.length) return;
      let possibleRoutes = routes.filter(
        (x) => x.from == placeId && x.to == result[j + 1]
      );
      possibleRoutes = possibleRoutes.filter((x) =>
        allowedModes.includes(x.mode)
      );

      let from = places.filter((x) => x.id == placeId)[0];
      let to = places.filter((x) => x.id == result[j + 1])[0];

      if (possibleRoutes.length == 0) {
        if (from.type == "MRT" && to.type == "MRT") {
          if (
            from.x != undefined &&
            from.z != undefined &&
            to.x != undefined &&
            to.z != undefined
          ) {
            if (getDistance(from.x, from.z, to.x, to.z) < 250) {
              resultElem.append(render("transfer", from, to, undefined));
              return;
            }
          }
        }

        if (
          spawnWarps.includes(to.id) &&
          allowedModes.includes("spawnWarp") &&
          from.x != undefined &&
          from.z != undefined &&
          to.x != undefined &&
          to.z != undefined &&
          getDistance(from.x, from.z, to.x, to.z) > 250
        ) {
          resultElem.append(render("warp", from, to, undefined));
          return;
        }

        resultElem.append(render("walk", from, to, undefined));
        return;
      }

      // collapse MRT routes
      let nextPossibleRoutes = routes.filter(
        (x) => x.from == result[j + 1] && x.to == result[j + 2]
      );
      if (
        possibleRoutes[0]?.mode == "MRT" &&
        nextPossibleRoutes[0]?.mode == "MRT"
      ) {
        if (placeId.charAt(0) == result[j + 2].charAt(0)) {
          if (mrtPassAlong == undefined) mrtPassAlong = placeId;
          return;
        }
      }

      if (mrtPassAlong != undefined) {
        let route = possibleRoutes[0];

        from = places.filter((x) => x.id == mrtPassAlong)[0];

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

        resultElem.append(
          render("largeFlight", from, to, route).prop("outerHTML")
        );
        return;
      }

      resultElem.append(render("flightHeader", from, to, undefined));

      let multiflights = $("<div class='multiflight-container'></div>");

      possibleRoutes.forEach((flight) => {
        multiflights.append(render("smallFlight", from, to, flight));
      });

      resultElem.children().last().append(multiflights);
    });

    resultElem.append(
      `<button class="nav-start" tabindex="-1" onclick='startNavigation(${JSON.stringify(
        result
      )}, ${i})'>Start Navigation</button>`
    );

    $("#results").append(resultElem);
  });

  //make headers clickable
  initHeaders();
}

function render(
  type: renderTypes,
  from: Place,
  to: Place,
  route: Route | undefined
) {
  let currentDiv = $("<div class='leg'></div>");

  currentDiv.attr("data-place", to.id);

  if (type == "largeFlight") {
    if (route == undefined) throw new Error("Route not defined");
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
      codeshare = codeshares?.[route.provider]?.[route.number];

    let logo = logos[codeshare ?? route.provider];
    if (logo) {
      logo = `<img src="${logo}"/>`;
    } else {
      logo = "<div></div>";
    }
    //set color
    let color = `var(--provider-${safe(codeshare) ?? safe(route.provider)})`;
    currentDiv.css("background-color", color ?? "");

    currentDiv.append(`
      <div class="leg-blurb">
        ${logo}
        <div> ${codeshare ?? route.provider}</div>
        <div>Gates</div>
        <div>${blurbPrefix} ${route.number}</div>
        <div>${route.fromGate ?? "unk."} -> ${route.toGate ?? "unk."}</div>
      </div>
      <div class="leg-middle">
        <div class="leg-summary">
          <div class="leg-code">${from.shortName ?? "—"}</div>
          <div class="leg-arrow">-></div>
          <div class="leg-code">${to.shortName ?? "—"}</div>
        </div>
      </div>
      <div class="leg-details">
        <div>${from.displayName ?? from.longName ?? "Foobar"}</div>
        <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
      </div>
    `);
  } else if (type == "walk") {
    currentDiv.addClass("no-shadow");
    currentDiv.append(`
        <div class="leg-summary main-text"><span class="material-icons">
directions_walk
</span>
          <div class="leg-code">Walk to ${to.shortName ?? "--"}</div>
        </div>
        <div class="walk-details">
          <div></div>
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `);
  } else if (type == "warp") {
    currentDiv.addClass("no-shadow");
    currentDiv.append(`
        <div class="leg-summary main-text">
          <span class="material-icons">
            keyboard_double_arrow_right
          </span>
          <div class="leg-code">Warp to ${to.shortName ?? "--"}</div>
        </div>
        <div class="walk-details">
          <div></div>
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `);
  } else if (type == "MRT") {
    if (route == undefined) throw new Error("Route not defined");

    let color = `var(--provider-${safe(route.provider)})`;
    currentDiv.css("background-color", color ?? "");

    let provider = providers.filter((x) => x.name == route.provider)[0];

    currentDiv.append(`
        <div class="leg-blurb">
          <img src="https://www.minecartrapidtransit.net/wp-content/uploads/2015/01/logo.png">
          <div>${provider.displayName ?? provider.name}</div>
        </div>
        <div class="leg-middle">
          <div class="leg-summary">
            <div class="leg-code">${from.shortName}</div>
            <div class="leg-arrow">-></div>
            <div class="leg-code">${to.shortName}</div>
          </div>
        </div>
        <div class="leg-details">
          <div>${from.displayName ?? from.longName ?? "Foobar"}</div>
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `);
  } else if (type == "transfer") {
    currentDiv.addClass("no-shadow");
    currentDiv.append(`
        <div class="leg-summary main-text"><span class="material-icons">
transfer_within_a_station
</span>
          <div class="leg-code">Transfer to ${to.shortName ?? "--"}</div>
        </div>
        <div class="walk-details">
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `);
  } else if (type == "flightHeader") {
    currentDiv.append(`
        <div class="leg-middle" style='display:block'>
          <div class="leg-summary">
            <div class="leg-code">${from.shortName}</div>
            <div class="leg-arrow">-></div>
            <div class="leg-code">${to.shortName}</div>
          </div>
        </div>
        <div class="leg-details">
          <div>${from.displayName ?? from.longName ?? "Foobar"}</div>
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `);
  } else if (type == "smallFlight") {
    if (route == undefined) throw new Error("Route not defined");
    if (route.provider == undefined) throw new Error("Provider not defined");
    currentDiv.removeClass("leg");

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

    //codeshared flights
    let codeshare;
    if (route.number != undefined)
      codeshare = codeshares?.[route.provider]?.[route.number];

    let logo = logos[codeshare ?? route.provider];
    if (logo) {
      logo = `<img src="${logo}"/>`;
    } else {
      logo = "<div></div>";
    }

    //set color
    let color = `var(--provider-${safe(codeshare) ?? safe(route.provider)})`;
    currentDiv.css("background-color", color ?? "");

    currentDiv.addClass("multiflight");
    currentDiv.html(`
      ${logo ?? ""}
      <div class="multiflight-provider">
        <div>${codeshare ?? route.provider}</div>
        <div>${blurbPrefix} ${route.number}</div>
      </div>
      <div class="multiflight-gate">
        <div>Gates</div>
        <div class="multiflight-from">${route.fromGate ?? "unk."}</div>
        <div class="multiflight-arrow">-></div>
        <div class="multiflight-to">${route.toGate ?? "unk."}</div>
      </div>
    `);
  }
  return currentDiv;
}

$(".checkbox").on("change", function () {
  startSearch();
});

function calcDifferences(results: Array<Array<string>>) {
  let differences = [["Fastest Route"]];
  let firstResult = results[0];

  if (results.length == 1) return differences;

  results.forEach((route, i) => {
    if (i == 0) {
      let diff = firstResult.filter((x) => !results[1].includes(x));
      if (diff.length == 0) diff = ["Fastest Route"];
      differences[i] = diff;
      return;
    }
    let diff = route.filter((x) => !firstResult.includes(x));

    if (diff.length == 0) diff = ["Alternate Route"];

    differences[i] = diff;
  });

  differences.forEach((difference, j) => {
    if (difference.length > 2) {
      let newDiff: Array<string> = [];

      let pass: string | undefined = undefined;
      difference.forEach((place, i) => {
        if (i == difference.length - 1) {
          newDiff.push(pass ?? place.replace(/\d/g, ""));
        } else if (
          place.replace(/\d/g, "") == difference[i + 1].replace(/\d/g, "")
        ) {
          pass = place.replace(/\d/g, "");
        } else {
          newDiff.push(pass ?? place.replace(/\d/g, ""));
          pass = undefined;
        }
      });

      differences[j] = newDiff;
    }
  });

  return differences;
}

function initHeaders() {
  $(".route-header").on("click keypress", function (event) {
    if (a11yClick(event) !== true) return;
    $(this).children("span").toggleClass("flip");
    let parent = $(this).parent();
    parent.toggleClass("isVisible");

    if (parent.hasClass("isVisible")) {
      parent.children(".nav-start").attr("tabindex", "0");
      parent.css("max-height", "none");
      let height = Math.round(parent.height() ?? 999999) + "px";
      parent.css("max-height", "50px");
      setTimeout(function () {
        parent.css("max-height", height);
      }, 1);
    } else {
      parent.css("max-height", "50px");
      parent.children(".nav-start").attr("tabindex", "-1");
    }
  });

  $(".toggle-all").on("click keypress", function (event) {
    if (a11yClick(event) !== true) return;
    $(".route-header").click();
  });

  $(".route-header").first().click();
  setTimeout(function () {
    $(".route").first().css("max-height", "none");
  }, 10);
}

startSearch();
