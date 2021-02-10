// version should change when database changes significantly
// a different version will force a reload on the client after load

var version = 20210210
var updating = false

var dataSheetID = "13t7mHiW9HZjbx9eFP2uTAO5tLyAelt5_iITqym2Ejn8"
var transitSheetID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps"
var API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8"

var needsInit = false;

var holding = undefined
//transit sheet
$.ajax({
  url: "https://sheets.googleapis.com/v4/spreadsheets/" + transitSheetID + "/values:batchGet?" +
            "ranges='Airline Class Distribution'!A3:C161" + //airports
            "&ranges='Airline Class Distribution'!E2:AO2" + //company names
            "&ranges='Airline Class Distribution'!E3:AO161" + //actual flight numbers
            "&ranges='Helicopters'!A2:C155" + //heliports
            "&ranges='Helicopters'!E1:X1" + //companynames
            "&ranges='Helicopters'!E2:X155" + //actual flight numbers
            "&key=" + API_KEY,
  success: function(result) {
    if (holding == undefined) {
      holding = result
    } else {
      processSheets(result, holding)
    }}
});

//data sheet
$.ajax({
  url: "https://sheets.googleapis.com/v4/spreadsheets/" + dataSheetID + "/values:batchGet?" +
            "ranges='MRT'!B2:F19" +
            "&ranges='MRT'!B24:D1133" +
            "&ranges='Airports'!A2:D172" +
            "&ranges='Companies'!A2:C43" +
            "&key=" + API_KEY,
  success: function(result) {
    if (holding == undefined) {
      holding = result
    } else {
      processSheets(holding, result)
    }
  }
});

function processSheets(transitSheet, dataSheet) {

  //get data from MRT transit sheet
  let transitAirports = [...transitSheet.valueRanges[0].values]
  let transitCompanies = [...transitSheet.valueRanges[1].values[0]]
  let transitFlightData = [...transitSheet.valueRanges[2].values]

  //get heli data
  let heliports = [...transitSheet.valueRanges[3].values]
  let heliCompanies = [...transitSheet.valueRanges[4].values[0]]
  let transitHeliData = [...transitSheet.valueRanges[5].values]

  //we need to transpose the flight data
  transitFlightData = transpose(transitFlightData)

  //we need to transpose the flight data
  transitHeliData = transpose(transitHeliData)

  //get data from dataSheet
  let mrtLineInfo = [...dataSheet.valueRanges[0].values]
  let mrtStopInfo = [...dataSheet.valueRanges[1].values]
  let dataSheetAirports = [...dataSheet.valueRanges[2].values]
  let dataSheetCompanies = [...dataSheet.valueRanges[3].values]

  // inst
  locationList = []
  routeList = []
  placeList = []

  //// generate list of Airports, Heliports, etc
  locationObjectObject = {}

  //convert data sheet airports into something easier to use
  dataSheetAirportsObject = {}
  dataSheetAirports.forEach((airport, i) => {
    dataSheetAirportsObject[airport[0]] = {
      "code": airport[0],
      "displayName": airport[1],
      "keywords": airport[2],
      "transfers": airport[3]
    }
  });

  heliportsObject = {}
  heliports.forEach((heliport, i) => {
    heliportsObject[(heliport[1] == undefined || heliport[1] == "") ? heliport[0] : heliport[1]] = {
      "primaryID": (heliport[1] == undefined || heliport[1] == "") ? heliport[0] : heliport[1],
      "internalName": heliport[0],
      "code": heliport[1],
      "world": heliport[3],
      "type": "Heliport",
    }
  });

  //create an object for each airport and add it to list
  transitAirportsObject = {}
  transitAirports.forEach((airport, i) => {
    transitAirportsObject[airport[1]] = {
      "primaryID": airport[1],
      "code": airport[1],
      "internalName": airport[0],
      "world": airport[2],
      "type": "Airport",
    }
  });

  //combine objects
  locationObjectObject = deepExtend(dataSheetAirportsObject, transitAirportsObject)
  locationObjectObject = deepExtend(heliportsObject, locationObjectObject)

  //convert into array
  let locationKeys = Object.keys(locationObjectObject);
  locationKeys.forEach((locationKey) => {
    placeList.push(locationObjectObject[locationKey])
  });

  //generate list of flight routes data
  let airlines = []
  transitCompanies.forEach((company, i) => {
    let airline = {"airlineName": company, "airlineFlights": {}}
    transitFlightData[i].forEach((destination, j) => {
      if (destination == "" || destination == undefined) return
      destination.split(",").forEach((flight, k) => {
        number = flight.trim()
        if (airline.airlineFlights[number] == undefined) {
          airline.airlineFlights[number] = []
        }
        // add current airport to flight object
        airline.airlineFlights[number].push(transitAirports[j][1])
      });
    });
    airlines.push(airline)
  });

  helilines = []
  //generate list of helicopter flights
  heliCompanies.forEach((company, i) => {
    let airline = {"airlineName": company, "airlineFlights": {}}
    if (transitHeliData[i] == undefined) return //skip if empty
    transitHeliData[i].forEach((destination, j) => {
      if (destination == "" || destination == undefined) return
      destination.split(",").forEach((flight, k) => {
        number = flight.trim()
        if (airline.airlineFlights[number] == undefined) {
          airline.airlineFlights[number] = []
        }
        // add current airport to flight object
        airline.airlineFlights[number].push((heliports[j][1] == "" || heliports[j][1] == undefined) ? heliports[j][0] : heliports[j][1])
      });
    });
    helilines.push(airline)
  });

  //now we use this flight data to actually generate routes
  airlines.forEach(airline => {
    //get all flight numbers for airline
    flights = airline.airlineFlights
    if (flights == undefined) return
    allNumbers = Object.keys(flights)
    //generate all possible routes
    allNumbers.forEach((number, i) => {
      for (var j = 0; j < flights[number].length; j++) {
        for (var k = 0; k < flights[number].length; k++) {
          if (j != k) {
            routeList.push({
              "From": flights[number][j],
              "To": flights[number][k],
              "Type": "Flight",
              "Company": airline.airlineName,
              "Number": number
            })
          }
        }
      }
    });
  });

  //and helilines is exactly the same but with a different type
  helilines.forEach(airline => {
    //get all flight numbers for airline
    flights = airline.airlineFlights
    if (flights == undefined) return
    allNumbers = Object.keys(flights)
    //generate all possible routes
    allNumbers.forEach((number, i) => {
      for (var j = 0; j < flights[number].length; j++) {
        for (var k = 0; k < flights[number].length; k++) {
          if (j != k) {
            routeList.push({
              "From": flights[number][j],
              "To": flights[number][k],
              "Type": "Heli",
              "Company": airline.airlineName,
              "Number": number
            })
          }
        }
      }
    });
  });

  //generate list of MRT stop routes
  mrtLineInfo.forEach((item, i) => {
    let minSE = 2;
    let maxNW = 3;
    let nsew = 4;
    let lineCode = item[1]
    let line = [];
    //0: {Name: "Artic Line", Code: "A", Min-SE: "X", Max-NW: "53"}
    if (item[minSE] == "X") {
      line = [lineCode + "X"]
      for (var i = 0; i <= item[maxNW]; i++) {
        line.push(lineCode + i)
      }
    } else if (item[minSE] == "XHW") {
      line = [lineCode + "X", lineCode + "H", lineCode + "W"]
      for (var i = 0; i <= item[maxNW]; i++) {
        line.push(lineCode + i)
      }
    } else if (item[nsew] == "NS") {
      for (var i = item[minSE]; i > 0; i--) {
        line.push(lineCode + "S" + i)
      }
      line.push(lineCode + "0")
      for (var i = 1; i <= item[maxNW]; i++) {
        line.push(lineCode + "N" + i)
      }
    } else if (item[nsew] == "EW") {
      for (var i = item[minSE]; i > 0; i--) {
        line.push(lineCode + "E" + i)
      }
      line.push(lineCode + "0")
      for (var i = 1; i <= item[maxNW]; i++) {
        line.push(lineCode + "W" + i)
      }
    } else {
      for (var i = 1; i <= item[maxNW]; i++) {
        line.push(lineCode + i)
      }
    }

    //create routes
    for (var i = 0; i < line.length; i++) {
      if (i != 0) {
        routeList.push({
          "From": line[i],
          "To": line[i-1],
          "Type": "MRT"
        })
      }
      if (i != line.length-1) {
        routeList.push({
          "From": line[i],
          "To": line[i+1],
          "Type": "MRT"
        })
      }
    }
  });

  //and generate stop names for place list

  mrtStopInfo.forEach((item, i) => {
    //add place
    if (item[0] == undefined) return
    placeList.push({
      "primaryID": item[0],
      "code": item[0],
      "displayName": (item[1] == "" || item[1 == undefined]) ? "Foobar" : item[1],
      "type": "MRT"
    })

    //generate routes from routeinfos
    if (item[2] != undefined) {
      let transfers = item[2].split(",")
      transfers.forEach((transfer, i) => {
        routeList.push({
          "From": item[0],
          "To": transfer,
          "Type": "MRT Transfer"
        })
      });

    }
  });

  //and C is a ring line, so add those
  routeList.push({
    "From": "C1",
    "To": "C119",
    "Type": "MRT"
  })
  routeList.push({
    "From": "C119",
    "To": "C1",
    "Type": "MRT"
  })

  //and don't forget to generate walking routes!
  placeList.forEach((item, i) => {
    if (item["transfers"] != undefined) {
      let dests = item["transfers"].split(",")

      dests.forEach((dest, j) => {
          routeList.push({
            "From": item.primaryID,
            "To": dest,
            "Type": "Walk"
          })
          routeList.push({
            "From": dest,
            "To": item.primaryID,
            "Type": "Walk"
          })
      });

    }
  });

  setItem("routeList", routeList)
  setItem("placeList", placeList)

  //set legacy gate numbers and
  //request new gate numbers

  let requestURL = "https://sheets.googleapis.com/v4/spreadsheets/" + dataSheetID +
  "/values:batchGet?ranges='Legacy Gate Data'!A:D"

  dataSheetCompanies.forEach((company, i) => {
    if (company.length > 1) {
      if (company[1] == "Yes") {
        requestURL += "&ranges='" + company[0] + "'!A:D"
      }
    }
  });

  $.ajax({
    url: requestURL + "&key=" + API_KEY,
    success: function(result) {
        processGateNumbers(result, dataSheetCompanies)
      }
  });

  if (needsInit == true) {
    $(".selection-container").css("display", "block")
    $("#initLoad").css("display", "none")
    initUI();
  }

  //if updating reload
  if ( updating == true ) {
    setItem("version", version)
    sessionStorage.clear();
    window.location.reload()
  }

}

function processGateNumbers (result, companies) {
  gateData = []

  sheets = result.valueRanges

  legacySheet = sheets.shift().values
  legacySheet.shift()

  //process legacy gates
  companies.forEach((company, i) => {
    if (company.length > 1) {
      if (company[1] == "Legacy") {
        let flights = legacySheet.filter(x => x[0] == company[2])
        flights.forEach((item) => {
          item[0] = company[0]
        });
        gateData = [...gateData, ...flights]
      }
    }
  });

  //process other gates

  sheets.forEach((sheet) => {

    if (sheet.range.indexOf("'") == -1) {
      companyName = sheet.range.split("!")[0]
    } else {
      companyName = sheet.range.split("'")[1]
    }

    flights = sheet.values
    flights.forEach((flight) => {
      flight[0] = companyName
    });

    gateData = [...gateData, ...flights]
  });

  setItem("gateData", gateData)

  routeList = getItem("routeList")

  //now add gate info to routes
  routeList.forEach((route, i) => {
    if (gateData.filter(x => (x[0] == route["Company"] && x[1] == route["Number"] && x[2] == route["From"])).length > 0) {
      routeList[i]["hasFromGateData"] = true
    }
    if (gateData.filter(x => (x[0] == route["Company"] && x[1] == route["Number"] && x[2] == route["To"])).length > 0) {
      routeList[i]["hasToGateData"] = true
    }
  });

  setItem("routeList", routeList)

}


function getGateData (company, flightNumber, airport) {

  gateData = getItem("gateData")

  //if gate data doesn't exist, we don't know yet
  if (gateData == null) return "unk."

  gate = gateData.filter(x => (x[0] == company && x[1] == flightNumber && x[2] == airport))[0]

  if (gate == undefined) return "unk."
  else return gate[3]
}

function populateResults(results){
  let places = getItem("placeList")

  if (results == "Destination airport not supported") {
    $("#results").append("<div class='route'>Destination unreachable</div>")
    $("#searching").css("display", "none")
    return
  }

  if (results == "found") {
    $("#searching").children().first().html("Checking for better paths...")
    return
  } else {
    $("#searching").css("display", "none")
    $("#searching").children().first().html("Searching...")
  }

  if (results.length == 0) {
    $("#results").append("<div class='route'>Unable to find a path.</div>")
  }

  if (results.length >= 1 && $(".route").html() == "Unable to find a path.") {
    $("#results").html("") // to prevent accidentally having no results, followed by results
  }

  results.forEach((result, i) => {
    //skip if already in existance
    if($("#results").children().length > i) {return}

    $("#results").append("<div class='route'>Option " + (i + 1) + "</div>")
    //add to dom
    result.forEach((item, j) => {

      // collapse MRT routes
      if (result[j+1] != undefined && item.Type == "MRT" && result[j+1].Type == "MRT") {
        if (item.From.charAt(0) == result[j+1].To.charAt(0)) {
          result[j+1].From = item.From;
          return
        }
      }

      $("#results").children().last().append("<div class='leg'></div>")
      currentDiv = $("#results").children().last().children().last();

      let fromDisplay = places.find(x => x.primaryID === item.From).displayName
      let toDisplay = places.find(x => x.primaryID === item.To).displayName

      if (fromDisplay == undefined) fromDisplay = places.find(x => x.primaryID === item.From).internalName
      if (toDisplay == undefined) toDisplay = places.find(x => x.primaryID === item.To).internalName

      if (item.Type == "Flight") {
        currentDiv.append(`
          <div class="leg-blurb">
            Flight ${item.Number} by ${item.Company}
          </div>
          <div class="leg-summary">
            <div class="leg-code">${(item.From.length > 4) ? "—" : item.From}</div>
            <div class="leg-gate">
              <div>Gate</div>
              <div>${getGateData(item.Company, item.Number, item.From)}</div>
            </div>
            <div class="leg-arrow">&#x2794;</div>
            <div class="leg-gate">
              <div>Gate:</div>
              <div>${getGateData(item.Company, item.Number, item.To)}</div>
            </div>
            <div class="leg-code">${(item.To.length > 4) ? "—" : item.To}</div>
          </div>
          <div class="leg-details">
            <div>${fromDisplay}</div>
            <div>${toDisplay}</div>
          </div>
        `)
      } else if (item.Type == "Heli") {
        currentDiv.append(`
          <div class="leg-blurb">
            Helicopter Flight ${item.Number} by ${item.Company}
          </div>
          <div class="leg-summary">
            <div class="leg-code">${(item.From.length > 4) ? "—" : item.From}</div>
            <div class="leg-gate">
              <div>Gate</div>
              <div>${getGateData(item.Company, item.Number, item.From)}</div>
            </div>
            <div class="leg-arrow">&#x2794;</div>
            <div class="leg-gate">
              <div>Gate:</div>
              <div>${getGateData(item.Company, item.Number, item.To)}</div>
            </div>
            <div class="leg-code">${(item.To.length > 4) ? "—" : item.To}</div>
          </div>
          <div class="leg-details">
            <div>${fromDisplay}</div>
            <div>${toDisplay}</div>
          </div>
        `)
      } else {
        currentDiv.append(`
          <div class="leg-blurb">
            By ${item.Type}
          </div>
          <div class="leg-summary">
            <div class="leg-code">${item.From}</div>
            <div class="leg-arrow">&#x2794;</div>
            <div class="leg-code">${item.To}</div>
          </div>
          <div class="leg-details">
            <div>${fromDisplay == undefined ? "Foobar" : fromDisplay}</div>
            <div>${toDisplay == undefined ? "Foobar" : toDisplay}</div>
          </div>
        `)
      }

      if (item.Active == "FALSE") {
        currentDiv.append(`<div>This route may not be open.</div>`)
      }

    });

  });

}

function initUI() {
  console.log("intializing UI")
  placeList = getItem("placeList")

  if (placeList == null) { // if this triggers it's their first visit
    localStorage.clear()
    sessionStorage.clear()
    needsInit = true
    setItem("version", version)
    $(".title-container").css("animation", "none")
    $(".selection-container").css("display", "none")
    $("#initLoad").css("display", "flex")
    return
  }

  //reset select boxes
  $('#to, #from').children().remove()
  $('#to, #from').append("<option></option>")
  let selection = [
    {
      "text": "Airports",
      "children" : []
    },
    {
      "text": "MRT Stops",
      "children" : []
    },
    {
      "text": "Heliports",
      "children" : []
    },
    {
      "text": "Old World",
      "children" : []
    }
  ]


  for (var i = 0; i < placeList.length; i++) {

    if (placeList[i] == null) {
      console.log("Misformed places at index " + i + ", discarding")
      continue
    }

    let name
    if (placeList[i].displayName != undefined) {name = placeList[i].displayName}
    else if (placeList[i].internalName != undefined) {name = placeList[i].internalName}
    else {name = "Foobar"}

    let optionText = `${(placeList[i].code == undefined || placeList[i].code == "") ? "" : placeList[i].code + " - "}${name}`
    if (placeList[i]["world"] == "Old") {
      selection[3]["children"].push({
          "id": placeList[i].primaryID,
          "text": optionText
      })
    } else if (placeList[i]["type"] == "Airport") {
      selection[0]["children"].push({
          "id": placeList[i].primaryID,
          "text": optionText
      })
    } else if (placeList[i]["type"] == "MRT") {
      selection[1]["children"].push({
          "id": placeList[i].primaryID,
          "text": optionText
      })
    } else if (placeList[i]["type"] == "Heliport") {
      selection[2]["children"].push({
          "id": placeList[i].primaryID,
          "text": optionText
      })
    } else {
      selection.push({
          "id": placeList[i].primaryID,
          "text": optionText
      })
    }

  }

  $('#to').select2({
    placeholder: "Where to?",
    allowClear: true,
    width: 'resolve',
    data: selection,
    matcher: customMatcher,
    sorter: sortResults
  });
  $('#from').select2({
    placeholder: "Where from?",
    allowClear: true,
    width: 'resolve',
    data: selection,
    matcher: customMatcher,
    sorter: sortResults
  });
  $('#to, #from').on('select2:open', function(e) {
    $('input.select2-search__field').prop('placeholder', 'Search by airport, city, or MRT stop');
  });

  //initial version check
  currVersion = getItem("version");

  if ( currVersion != version ) {
    console.log("Updating from version " + currVersion + " to " + version)
    updating = true;
    setTimeout(function(){window.location.reload()}, 20 * 1000)
    $("#results").append("<h2 style='text-align: center'>New version available. Updating...</h2>")
    $(".selection-container").remove()
  }

}

$("input").on("change", function(e) {
  $("#from").trigger("select2:select")
})
$('#from, #to').on('select2:select', function (e) {

  $("#results").html("")
  if ($("#from").val() == "" || $("#to").val() == "") {return}
  $("#searching").css("display", "block")

  routes = getItem("routeList")
  if ($("#airports-check").prop("checked") == false) {
    routes = routes.filter(route => route.Type !== "Flight");
  }
  if ($("#mrt-check").prop("checked") == false) {
    routes = routes.filter(route => route.Type !== "MRT");
  }
  if ($("#heli-check").prop("checked") == false) {
    routes = routes.filter(route => route.Type !== "Heli");
  }
  worker.postMessage([$("#from").val(), $("#to").val(), getItem("placeList"), routes, $("#tp-check").prop("checked")])
});

try {
  if (typeof(worker) == "undefined") {
    worker = new Worker("./js/calc.js");
  }
} catch (e) {
  alert("Something went wrong. Your browser might not be supported.")
  console.log(e)
}

worker.onmessage = function(e) {
  if (e.data != "pass") {
    populateResults(e.data, getItem("placeData"))
  } else {
    $("#searching").css("display", "none")
  }
}

//custom matcher
var defaultMatcher = $.fn.select2.defaults.defaults.matcher;

function sortResults(results){
  return results.sort((a,b) => {return (a.children.length > b.children.length) ? -1 : 1})
}

function customMatcher(params, data) {

  //get data if it doesn't exist
  if (placeList == null || placeList == undefined) {
    placeList = getItem("placeList");
  }

  // If there are no search terms, return all of the data
  if ($.trim(params.term) === '') {
    return data;
  }

  // Skip if there is no 'children' property
  if (typeof data.children === 'undefined') {
    return defaultMatcher(params, data);
  }

  // for each child
  var relevantChildren = [];
  var keywordChildren = [];
  var defaultChildren = [];
  var filteredChildren = [];
  $.each(data.children, function (idx, child) {
    let placeInfo = placeList.filter(x => x.primaryID == child.id)[0]
    //relevant search
    if (child.text.toUpperCase().indexOf(params.term.toUpperCase()) == 0) {
      relevantChildren.push(child);
    } else if (placeInfo["keywords"] != undefined && placeInfo["keywords"].toUpperCase().indexOf(params.term.toUpperCase()) != -1) {
      //keyword search
      keywordChildren.push(child);
    } else {
      //perform a default search
      let matched = defaultMatcher(params, child)
      if (matched != null) {
        defaultChildren.push(matched)
      }
    }
  });

  filteredChildren = [...relevantChildren, ...keywordChildren, ...defaultChildren]

  // If we matched any children set the matched children on the group
  // and return the group object
  if (filteredChildren.length) {
    var modifiedData = $.extend({}, data, true);
    modifiedData.children = filteredChildren;

    return modifiedData;
  }

  return null;
}

initUI()
