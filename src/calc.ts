type SWCode = "calc" | "cancel" | "report" | "complete" | "exited"
  | "genTimeMaps" | "failed" | "timeMapsNeeded"
type renderTypes = "flightHeader" | "largeFlight" | "smallFlight"
  | "MRT" | "walk" | "transfer"

let approxRouteTime

async function findShortestPath(startNode: string, endNode: string, allowedModes: Array<Mode>, dataCallback: Function): Promise<Array<Array<string>>> {
  return new Promise(async (resolve, reject) => {
    let hasGen = false
    calculationWorker.postMessage(["calc", startNode, endNode, allowedModes])
    calculationWorker.onmessage = async function(e) {
      console.log("MESSAGE FROM WORKER", e.data)
      let code = e.data[0]
      if (code == "complete") {
        console.log("COMPLETE")
        $("#searching").css("display", "none")
        resolve(e.data[1])
      }
      if (code == "report") {
        e.data.shift()
        dataCallback(e.data)
      }
      if (code == "failed") {
        $("#searching").css("display", "none")
        $("#progress-bar").fadeOut()
        $("#results").append("<div class='route'>No routes found</div>")
        reject()
      }
      if (code == "timeMapsNeeded") {

        console.log("REQUEST FOR GEN RECIEVED")

        if (hasGen == false) {
          hasGen = true
          await generateTimeMaps(routes, places)
          console.log("GEN COMPLETE")
          findShortestPath(startNode, endNode, allowedModes, dataCallback).then(resolve)
        } else {
          console.log("REQUEST FOR GEN RECIEVED TWICE, FAILING")
          $("#searching").css("display", "none")
          reject()
        }
      }
    }
  })
}

function generateTimeMaps(routes: Array<Route>, places: Array<Place>) {
  return new Promise(async resolve => {
    calculationWorker.postMessage(["genTimeMaps", routes, places])
    calculationWorker.onmessage = function(e) {
      let code = e.data[0]
      if (code == "genTimeMaps") resolve(true)
    }
  })
}

if (window.Worker) {

  var calculationWorker = new Worker('./dist/worker.js');

}

let allowedModes: Array<Mode> = []

function startSearch() {

  allowedModes = ["walk"]
  $(".checkbox").each(function() {
    let mode = $(this).attr("data-mode") as Mode
    let checked = $(this).is(":checked")
    if (checked) {
      allowedModes.push(mode)
    }
  });

  if ($(".menu").hasClass("menuIsVisible")) {
    return
  }

  console.log("ALLOWED MODES", allowedModes)

  if (allowedModes.length == 0) {
    return
  }

  let from = $("#from").attr("data") ?? ""
  let to = $("#to").attr("data") ?? ""

  if (from == to) {
    $("#results").html("")
    return
  }

  if (from != "" && to != "") {

    console.log("starting search")

    $("#results").html("")
    $("#searching").fadeIn()

    $("#progress-bar").fadeIn()
    findShortestPath(from, to, allowedModes, function(data: any) {
      if (data[0] == data[1])
        approxRouteTime = data[0]
      let progress = Math.round(data[0] / data[1] * 100)
      console.log("progress ", progress)
      $("#progress-bar").css("transform", "scaleX(" + progress * 2 + ")")
    }).then(populateResults)
  }
}

function deTransferIfy(results: Array<Array<string>>): Array<Array<string>> {

  results = results.sort((a, b) => {
    let intersectionA = a.filter(x => !b.includes(x));
    let intersectionB = b.filter(x => !a.includes(x));
    return intersectionA[0] < intersectionB[0] ? 1 : -1
  })

  for (let i = 0; i < results.length - 1; i++) {

    let a = results[i]
    let b = results[i + 1]

    let intersectionA = a.filter(x => !b.includes(x));
    let intersectionB = b.filter(x => !a.includes(x));

    if (intersectionA.length == 1 && intersectionB.length == 1) {
      console.log("difference is same length", i)
      if (a.indexOf(intersectionA[0]) == b.indexOf(intersectionB[0])) {
        console.log("difference is in same spot", i)

        results.splice(i, 1)
        i--

      }
    }
  }

  return results
}

function populateResults(results: Array<Array<string>>) {

  $("#progress-bar").css("transform", "scaleX(200)")
  setTimeout(function() {
    $("#progress-bar").fadeOut(500)
    setTimeout(function() {
      $("#progress-bar").css("transform", "scaleX(1)")
    }, 500)
  }, 500)

  results = deTransferIfy(results)
  results = deTransferIfy(results)
  results = deTransferIfy(results)


  if (results.length == 0) {
    $("#results").append("<div class='route'>Something went wrong</div>")
  }

  results.forEach((result, i) => {

    let resultElem = $("<div class='route'>Option " + (i + 1) + "</div>")
    //add to dom

    let mrtPassAlong: string | undefined = undefined;
    result.forEach((placeId, j) => {

      if (j + 2 > result.length) return
      let possibleRoutes = routes.filter(x => x.from == placeId && x.to == result[j + 1])
      possibleRoutes = possibleRoutes.filter(x => allowedModes.includes(x.mode))

      let from = places.filter(x => x.id == placeId)[0]
      let to = places.filter(x => x.id == result[j + 1])[0]

      if (possibleRoutes.length == 0) {

        if (from.type == "MRT" && to.type == "MRT") {
          resultElem.append(render("transfer", from, to, undefined))
          return
        }

        resultElem.append(render("walk", from, to, undefined))
        return
      }

      // collapse MRT routes
      let nextPossibleRoutes = routes.filter(x => x.from == result[j + 1] && x.to == result[j + 2])
      if (possibleRoutes[0] ?.mode == "MRT" && nextPossibleRoutes[0] ?.mode == "MRT") {
        if (placeId.charAt(0) == result[j + 2].charAt(0)) {
          if (mrtPassAlong == undefined)
            mrtPassAlong = placeId
          return
        }
      }

      if (mrtPassAlong != undefined) {

        let route = possibleRoutes[0]

        from = places.filter(x => x.id == mrtPassAlong)[0]

        resultElem.append(render("MRT", from, to, route))
        mrtPassAlong = undefined
        return
      }

      if (possibleRoutes[0].mode == "MRT") {

        let route = possibleRoutes[0]

        resultElem.append(render("MRT", from, to, route))
        return
      }

      if (possibleRoutes.length == 1) {

        let route = possibleRoutes[0]

        if (route == undefined || from == undefined || to == undefined)
          throw new Error("Cannot render flight")

        resultElem.append(render("largeFlight", from, to, route).prop('outerHTML'))
        return
      }

      resultElem.append(render("flightHeader", from, to, undefined))

      possibleRoutes.forEach(flight => {
        resultElem.children().last().append(
          render("smallFlight", from, to, flight)
        )
      })

    });

    $("#results").append(resultElem)

  });

}

function render(type: renderTypes, from: Place, to: Place, route: Route | undefined) {

  let currentDiv = $("<div class='leg'></div>")

  if (type == "largeFlight") {
    if (route == undefined) throw new Error("Route not defined")
    //get blurb
    let blurbPrefix
    switch (route.mode) {
      case "flight":
        blurbPrefix = "Flight"
        break;
      case "seaplane":
        blurbPrefix = "Seaplane flight"
        break;
      case "heli":
        blurbPrefix = "Helicopter flight"
        break;
      default:
        blurbPrefix = "By"
    }

    if (route.provider == undefined) {
      throw new Error("No provider specified")
    }

    //codeshared flights
    let codeshare
    if (route.number != undefined)
      codeshare = codeshares ?.[route.provider] ?.[route.number]

    let logo = logos[codeshare ?? route.provider]
    if (logo) {
      logo = `<img src="${logo}"/>`
    } else {
      logo = "<div></div>"
    }

    //change stuff if we don't have an image
    let modifiedStyle
    if (!logo) modifiedStyle = "style='display:block'"

    //set color
    let color = colors[codeshare ?? route.provider]
    currentDiv.css("background-color", color ?? "")

    currentDiv.append(`
      <div class="leg-blurb">
        ${blurbPrefix} ${route.number} by ${codeshare ?? route.provider}
      </div>
      <div class="leg-middle" ${modifiedStyle}>
        ${logo}
        <div class="leg-summary">
          <div class="leg-code">${from.shortName ?? "—"}</div>
          <div class="leg-gate">
            <div>Gate:</div>
            <div>${route.fromGate ?? "unk."}</div>
          </div>
          <div class="leg-arrow">-></div>
          <div class="leg-gate">
            <div>Gate:</div>
            <div>${route.toGate ?? "unk."}</div>
          </div>
          <div class="leg-code">${to.shortName ?? "—"}</div>
        </div>
      </div>
      <div class="leg-details">
        <div>${from.displayName ?? from.longName ?? "Foobar"}</div>
        <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
      </div>
    `)
  }
  else if (type == "walk") {
    currentDiv.append(`
        <div class="leg-summary"><span class="material-icons">
directions_walk
</span>
          <div class="leg-code">Walk to ${to.shortName ?? "--"}</div>
        </div>
        <div class="walk-details">
          <div></div>
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `)
  }
  else if (type == "MRT") {
    if (route == undefined) throw new Error("Route not defined")

    let color = colors[route.provider ?? ""]
    currentDiv.css("background-color", color ?? "")

    let provider = providers.filter(x => x.name == route.provider)[0]

    currentDiv.append(`
        <div class="leg-blurb">
        By the ${provider.displayName ?? provider.name}
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
          <div>${from.displayName ?? from.longName ?? "Foobar"}</div>
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `)
  }
  else if (type == "transfer") {

    currentDiv.append(`
        <div class="leg-summary"><span class="material-icons">
transfer_within_a_station
</span>
          <div class="leg-code">Transfer to ${to.shortName ?? "--"}</div>
        </div>
        <div class="walk-details">
          <div>${to.displayName ?? to.longName ?? "Foobar"}</div>
        </div>
      `)
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
        <div>
        <p>Flight offered by:</p>
        </div>
      `)
  } else if (type == "smallFlight") {
    if (route == undefined) throw new Error("Route not defined")
    if (route.provider == undefined) throw new Error("Provider not defined")
    currentDiv.removeClass("leg")

    //codeshared flights
    let codeshare
    if (route.number != undefined)
      codeshare = codeshares ?.[route.provider] ?.[route.number]

    let logo = logos[codeshare ?? route.provider]
    if (logo)
      logo = `<img src="${logo}"/>`

    currentDiv.append(`
      <div class="multiflight">
        ${logo ?? ""}
        <div class="multiflight-provider">By ${codeshare ?? route.provider}</div>
        <div class="multiflight-from">${route.fromGate ?? "unk."}</div>
        <div class="multiflight-arrow">-></div>
        <div class="multiflight-to">${route.toGate ?? "unk."}</div>
      </div>
    `)
  }
  return currentDiv

}

$(".checkbox").on("change", function() {
  startSearch()
})

startSearch()
