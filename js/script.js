var routesUrl = "https://spreadsheets.google.com/feeds/cells/1EQVk23tITO48PkeB22cO5FgQLjzduKBP8R-mp_dUttQ/2/public/full?alt=json";
var placesUrl = "https://spreadsheets.google.com/feeds/cells/1EQVk23tITO48PkeB22cO5FgQLjzduKBP8R-mp_dUttQ/3/public/full?alt=json";
var mrtUrl = "https://spreadsheets.google.com/feeds/cells/1EQVk23tITO48PkeB22cO5FgQLjzduKBP8R-mp_dUttQ/4/public/full?alt=json";
var needsInit = false;
var routesData;
var placesData

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
      let stations = item["MRT Station"].split(",")

      stations.forEach((station, j) => {
          routes.push({
            "From": item.Name,
            "To": station,
            "Type": "Walk"
          })
          routes.push({
            "From": station,
            "To": item.Name,
            "Type": "Walk"
          })
      });

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
            "Type": "MRT Transfer"
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

  if (placesData == null || placesData == undefined) {
    placesData = getItem("places")
  }

  let places = placesData

  if (results.length == 0) {
    $("#results").append("<div class='route'>Unable to find a path.</div>")
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

      let fromDisplay = places.find(x => x.Name === item.From).DisplayName
      let toDisplay = places.find(x => x.Name === item.To).DisplayName

      if (item.Type == "Flight") {
        currentDiv.append(`
          <div class="leg-blurb">
            Flight ${item.Number} by ${item.Company}
          </div>
          <div class="leg-summary">
            <div class="leg-code">${item.From}</div>
            <div class="leg-gate">
              <div>Gate</div>
              <div>${item.ArriveGate == undefined ? "Unknown" : item.ArriveGate }</div>
            </div>
            <div class="leg-arrow">&#x2794;</div>
            <div class="leg-gate">
              <div>Gate:</div>
              <div>${item.DepartGate == undefined ? "Unknown" : item.DepartGate }</div>
            </div>
            <div class="leg-code">${item.To}</div>
          </div>
          <div class="leg-details">
            <div>${fromDisplay == undefined ? "Foobar" : fromDisplay}</div>
            <div>${toDisplay == undefined ? "Foobar" : toDisplay}</div>
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
  let places = getItem("places")
  if (places == null) { // if this triggers it's their first visit
    needsInit = true
    $(".title-container").css("animation", "none")
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
    data: selection,
    matcher: customMatcher
  });
  $('#from').select2({
    placeholder: "Where from?",
    allowClear: true,
    width: 'resolve',
    data: selection,
    matcher: customMatcher
  });
  $('#to, #from').on('select2:open', function(e) {
    $('input.select2-search__field').prop('placeholder', 'Search by airport, city, or MRT stop');
  });
}

$("#airports-check, #mrt-check").on("change", function(e) {
  console.log("ya")
  $("#from").trigger("select2:select")
})

$('#from, #to').on('select2:select', function (e) {
  $("#results").html("")
  if ($("#from").val() == "" || $("#to").val() == "") {return}
  $("#searching").fadeIn()

  routes = getItem("routes")
  if ($("#airports-check").prop("checked") == false) {
    routes = routes.filter(route => route.Type !== "Flight");
  }
  if ($("#mrt-check").prop("checked") == false) {
    routes = routes.filter(route => route.Type !== "MRT");
  }
  console.log(routes)
  worker.postMessage([$("#from").val(), $("#to").val(), getItem("places"), routes])
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
  $("#searching").css("display", "none")
  if (e.data != "pass") {
    populateResults(e.data)
  }
}

//custom matcher
var defaultMatcher = $.fn.select2.defaults.defaults.matcher;
function customMatcher(params, data) {

  //get data if it doesn't exist
  if (placesData == null || placesData == undefined) {
    placesData = getItem("places");
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
    let placeInfo = placesData.filter(x => x.Name == child.id)[0]
    //relevant search
    if (child.text.toUpperCase().indexOf(params.term.toUpperCase()) == 0) {
      relevantChildren.push(child);
    } else if (placeInfo["Keywords"] != undefined && placeInfo["Keywords"].toUpperCase().indexOf(params.term.toUpperCase()) != -1) {
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
update()

routesData = getItem("routes")
placesData = getItem("places")
