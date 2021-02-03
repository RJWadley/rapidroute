var routesUrl = "https://spreadsheets.google.com/feeds/cells/1EQVk23tITO48PkeB22cO5FgQLjzduKBP8R-mp_dUttQ/2/public/full?alt=json";
var placesUrl = "https://spreadsheets.google.com/feeds/cells/1EQVk23tITO48PkeB22cO5FgQLjzduKBP8R-mp_dUttQ/3/public/full?alt=json";
var mrtUrl = "https://spreadsheets.google.com/feeds/cells/1EQVk23tITO48PkeB22cO5FgQLjzduKBP8R-mp_dUttQ/4/public/full?alt=json";
var needsInit = false;

function update() {
  $.ajax({
    url: routesUrl,
    success: function(result){
      parseRoutes(result)
    }});
}

function parseRoutes(jason) {

  let routes = []
  let titles = []

  jason.feed.entry.forEach((item, i) => {
    row = item.gs$cell.row
    col = item.gs$cell.col
    if (col == 1 || col >= 11) {
      return
    }

    content = item.content.$t

    if (row == 1) {
      titles.push(content)
    } else {
      if (routes[row-2] == undefined) {
        routes[row-2] = {}
      }
      routes[row-2][titles[col-2]] = content
    }
  })

  setItem("routes", routes)

  $.ajax({
    url: placesUrl,
    success: function(result){
      parsePlaces(result)
    }});

}

function parsePlaces(jason) {
  let places = []
  let routes = getItem("routes")
  let titles = []

  jason.feed.entry.forEach((item, i) => {
    row = item.gs$cell.row
    col = item.gs$cell.col
    if (col > 6) {
      return
    }

    content = item.content.$t

    if (row == 1) {
      titles.push(content)
    } else {
      if (places[row-2] == undefined) {
        places[row-2] = {}
      }
      places[row-2][titles[col-1]] = content
    }
  })

  places.forEach((item, i) => {
    if (item["MRT Station"] != undefined) {
        routes.push({
          "From": item.Name,
          "To": item["MRT Station"],
          "Type": "Walk"
        })
        routes.push({
          "From": item["MRT Station"],
          "To": item.Name,
          "Type": "Walk"
        })
    }
  });

  $.ajax({
    url: mrtUrl,
    success: function(result){
      parseMRT(result)
  }});

  setItem("routes", routes)
  setItem("places", places)

}

function parseMRT(jason) {
    let routes = getItem("routes")
    routeInfos = []
    stopInfos = []

    //for each spreadsheet cell
    jason.feed.entry.forEach((item, i) => {
      row = item.gs$cell.row
      col = item.gs$cell.col
      if (col > 6 || col == 1) {
        return
      }

      titles = ["Name","Code","Min-SE","Max-NW","NS-EW"]
      stopTitles = ["Code", "Name", "Transfers"]

      content = item.content.$t

      if (row < 20 && row > 1) {
        if (routeInfos[row-2] == undefined) {
          routeInfos[row-2] = {}
        }
        routeInfos[row-2][titles[col-2]] = content
      }

      if (row > 23) {
        if (stopInfos[row-24] == undefined) {
          stopInfos[row-24] = {}
        }
        if (col == 2 || col == 3 || col == 4) {
          stopInfos[row-24][stopTitles[col-2]] = content
        }

      }

    })

    //generate routes from routeinfos
    routeInfos.forEach((item, i) => {
      let line = [];
      //0: {Name: "Artic Line", Code: "A", Min-SE: "X", Max-NW: "53"}
      if (item["Min-SE"] == "X") {
        line = [item.Code + "X"]
        for (var i = 0; i <= item["Max-NW"]; i++) {
          line.push(item.Code + i)
        }
      } else if (item["Min-SE"] == "XHW") {
        line = [item.Code + "X", item.Code + "H", item.Code + "W"]
        for (var i = 0; i <= item["Max-NW"]; i++) {
          line.push(item.Code + i)
        }
      } else if (item["NS-EW"] == "NS") {
        for (var i = item["Min-SE"]; i > 0; i--) {
          line.push(item.Code + "S" + i)
        }
        line.push(item.Code + "0")
        for (var i = 1; i <= item["Max-NW"]; i++) {
          line.push(item.Code + "N" + i)
        }
      } else if (item["NS-EW"] == "EW") {
        for (var i = item["Min-SE"]; i > 0; i--) {
          line.push(item.Code + "E" + i)
        }
        line.push(item.Code + "0")
        for (var i = 1; i <= item["Max-NW"]; i++) {
          line.push(item.Code + "W" + i)
        }
      } else {
        for (var i = 1; i <= item["Max-NW"]; i++) {
          line.push(item.Code + i)
        }
      }


      for (var i = 0; i < line.length; i++) {
        if (i != 0) {
          routes.push({
            "From": line[i],
            "To": line[i-1],
            "Type": "MRT"
          })
        }
        if (i != line.length-1) {
          routes.push({
            "From": line[i],
            "To": line[i+1],
            "Type": "MRT"
          })
        }
      }

    });

    places = getItem("places")
    //generate places from stopinfos
    stopInfos.forEach((item, i) => {
      places.push({
        "Name": item["Code"],
        "DisplayName": item["Name"],
        "Type": "MRT"
      })

      //generate routes from routeinfos
      if (item["Transfers"] != undefined) {
        let transfers = item["Transfers"].split(",")
        transfers.forEach((transfer, i) => {
          routes.push({
            "From": item["Code"],
            "To": transfer,
            "Type": "MRT"
          })
          routes.push({
            "From": transfer,
            "To": item["Code"],
            "Type": "MRT"
          })
        });

      }

    });



    setItem("routes", routes)
    setItem("places", places)

    if (needsInit == true) {
      $(".selection-container").css("display", "block")
      $("#initLoad").css("display", "none")
      initUI();
    }
  }


function populateResults(results){
  let places = getItem("places")
  $("#results").html("")

  if (results.length == 0) {
    $("#results").append("<div class='route'>Unable to find a path.</div>")
  }

  results.forEach((result, i) => {
    $("#results").append("<div class='route'>ROUTE:</div>")
    //add to dom
    result.forEach((item, j) => {

      // collapse MRT routes
      if (result[j+1] != undefined && item.Type == "MRT" && result[j+1].Type == "MRT") {
        if (item.From.charAt(0) == result[j+1].To.charAt(0)) {
          result[j+1].From = item.From;
          return
        }
      }

      console.log(item)
      $("#results").children().last().append("<div class='leg'></div>")
      currentDiv = $("#results").children().last().children().last();
      currentDiv.append(`
        <div class="leg-summary">
          <div>${item.From}${places.find(x => x.Name === item.From).DisplayName}</div>
          <div>&#x2794;</div>
          <div>${item.To}</div>
        </div`)
      currentDiv.append(`<div>Type: ${item.Type}</div>`)

      if (item.Type == "Flight") {
        currentDiv.append(`<div>Company: ${item.Company}</div>`)
        currentDiv.append(`<div>Departure Gate: ${item.DepartGate}</div>`)
        currentDiv.append(`<div>Arrival Gate: ${item.ArriveGate}</div>`)
        currentDiv.append(`<div>Flight Number: ${item.Number}</div>`)
      }

      if (item.Active == "FALSE") {
        currentDiv.append(`<div>This route may not be open.</div>`)
      }

    });

  });

}

function initUI() {
  console.log("intializing UI")
  let places = getItem("places")
  if (places == null) { // if this triggers it's their first visit
    needsInit = true
    $(".selection-container").css("display", "none")
    $("#initLoad").css("display", "flex")
    return
  }
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
    }
  ]


  for (var i = 0; i < places.length; i++) {

    let optionText = `${places[i].Supported == "No" ? "(Unsupported) " : ""}${places[i].Name} - ${places[i].DisplayName == undefined ? "Foobar" : places[i].DisplayName}`

    if (places[i]["Type"] == "Airport") {
      selection[0]["children"].push({
          "id": places[i].Name,
          "text": optionText
      })
    } else if (places[i]["Type"] == "MRT") {
      selection[1]["children"].push({
          "id": places[i].Name,
          "text": optionText
      })
    } else {
      selection.push({
          "id": places[i].Name,
          "text": optionText
      })
    }

  }

  $('#to').select2({
    placeholder: "Where to?",
    allowClear: true,
    width: 'resolve',
    data: selection
  });
  $('#from').select2({
    placeholder: "Where from?",
    allowClear: true,
    width: 'resolve',
    data: selection
  });
}

$('#from, #to').on('select2:select', function (e) {
  $("#searching").css("display", "flex")
  $("#results").html("")
  worker.postMessage([$("#from").val(), $("#to").val(), getItem("places"), getItem("routes")])
});

if (typeof(worker) == "undefined") {
  worker = new Worker("./js/calc.js");
}

worker.onmessage = function(e) {
  $("#searching").css("display", "none")
  if (e.data != "pass") {
    populateResults(e.data)
  }
}

initUI()
update()
