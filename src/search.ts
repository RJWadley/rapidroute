// @ts-ignore
var searchWorker = new FlexSearch.Index({
  tokenize: "reverse"
});

function normalize(str: string | undefined) {
  if (str == undefined) return undefined
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function initSearch() {
  places.forEach(place => {

    let searchable = normalize(
      (place.displayName ?? "") + " " +
      (place.shortName ?? "") + " " +
      (place.longName ?? "") + " " +
      (place.keywords ?? "") + " " +
      place.world
    )

    searchWorker.add(
      place.id,
      searchable
    );
  })

  $(".search").on("keydown", function(e) {
    if (e.key == "Enter") {
      e.preventDefault()
      return
    }
  })

  $(".search").on("input", function() {

    let content = $(this).html()
    let id = $(this).attr("id")

    let results = searchWorker.search(
      content,
      {
        suggest: true
      }
    )

    updateSearchResults(results, id)
  })

}

function updateSearchResults(results: Array<string>, jqid: string | undefined) {
  if (jqid == undefined) return
  $(".search-results").html("").fadeIn()

  if (results.length == 0) {
    $(".search-results").html("No places found")
  }

  results.forEach(result => {
    let place = places.filter(x => x.id == result)[0]
    $(".search-results").append(`
      <div onclick="select('${place.id}', '${jqid}')">
        ${place.id} - ${place.displayName ?? place.longName}
      </div>
    `)
  });

  let firstResult = results[0]

  $("#" + jqid).off('keyup')
  $("#" + jqid).off('blur')

  $("#" + jqid).on('keyup', function(e) {
    if (e.key === 'Enter') {
      select(firstResult, jqid)
      document.getElementById(jqid) ?.blur()
    }
  });

  $("#" + jqid).on('blur', function() {
    setTimeout(function() {
      console.log($(".search-results").children().length)
      if ($(".search-results").children().length > 0)
        select(firstResult, jqid)
    }, 100)
  })

}

function select(placeId: string, jqid: string) {

  let place = places.filter(x => x.id == placeId)[0]

  if (place == undefined) {
    $("#" + jqid).removeAttr("data")
    $(".search-results").html("").css("display", "none")
  } else {
    $("#" + jqid).html(place.displayName ?? place.longName ?? place.id)
    $("#" + jqid).attr("data", placeId)
    $(".search-results").html("").css("display", "none")
  }

  startSearch()
}

$("#selection-swap").on("click", function() {

  let from = $("#from")
  let to = $("#to")

  from.off('keyup')
  from.off('blur')

  to.off('keyup')
  to.off('blur')

  let fromid = from.attr("data") ?? ""
  let toid = to.attr("data") ?? ""
  let fromContent = from.html()
  let toContent = to.html()

  from.attr("data", toid)
  to.attr("data", fromid)
  from.html(toContent)
  to.html(fromContent)

  startSearch()

})

$("#air-toggle").on("click", function() {
  $(".air-menu").toggleClass("menuIsVisible")
  $("#air-toggle span").toggleClass("flip")
  if (!$(".air-menu").hasClass("menuIsVisible")) {
    startSearch()
  }

})


$(".search").on("focus", function() {
  setTimeout(function() {
    document.execCommand('selectAll', false, undefined)
  }, 10)
})
