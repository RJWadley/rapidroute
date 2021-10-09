// @ts-ignore
var searchWorker = new FlexSearch.Index({
  tokenize: "reverse",
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


  $(".search").on("input", function(this) {
    let results = searchWorker.search(
      $(this).val(),
      {
        suggest: true
      }
    )
    updateSearchResults(results, $(this).attr("id"))
  })

}

function updateSearchResults(results: Array<string>, jqid: string | undefined) {
  if (jqid == undefined) return
  $(".search-results").html("")
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
    }
  });

  $("#" + jqid).on('blur', function(e) {
    select(firstResult, jqid)
  })


}

function select(placeId: string, jqid: string) {

  let place = places.filter(x => x.id == placeId)[0]

  if (place == undefined) {
    $("#" + jqid).removeAttr("data")
    $(".search-results").html("")
  } else {
    $("#" + jqid).val(place.displayName ?? place.longName ?? place.id)
    $("#" + jqid).attr("data", placeId)
    $(".search-results").html("")
  }
}
