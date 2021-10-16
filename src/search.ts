// @ts-ignore
var searchWorker = new FlexSearch.Index({
  tokenize: "reverse",
  charset: "latin:advanced",
});

// @ts-ignore
var strictSearchWorker = new FlexSearch.Index({
  tokenize: "strict",
  charset: "latin:advanced",
});

function normalize(str: string | undefined) {
  if (str == undefined) return undefined;
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function initSearch() {
  places.forEach((place) => {
    let searchable = normalize(
      (place.displayName ?? "") +
        " " +
        (place.shortName ?? "") +
        " " +
        (place.longName ?? "") +
        " " +
        (place.keywords ?? "") +
        " " +
        place.world
    );

    searchWorker.add(place.id, searchable);
    strictSearchWorker.add(place.id, searchable);
  });

  $(".search").on("input click", function () {
    let content = $(this).html();
    let id = $(this).attr("id");

    let parser = new DOMParser();
    let doc = parser.parseFromString(content, "text/html");

    content = doc.body.textContent ?? "";

    console.log(content);

    let strictResults = strictSearchWorker.search(content, {
      suggest: true,
      limit: 200,
    });

    let results = searchWorker.search(content, {
      suggest: false,
      limit: 200,
    });

    results = [...strictResults, ...results];
    results = [...new Set(results)];

    results = results.sort((x: string) => {
      return places.filter((z) => z.id == x)[0].type == "town" ? -1 : 0;
    });

    results = results.sort((x: string) => {
      return x.toUpperCase() === content.toUpperCase() ? -1 : 0;
    });

    console.log(results, results.length);

    // if (content == "") {
    //   places.forEach((place) => {
    //     results.push(place.id);
    //   });
    // }

    updateSearchResults(results, id);
  });
}

let highlightedResult: string | undefined = undefined;
let highlightedIndex: number = -1;

function updateSearchResults(results: Array<string>, jqid: string | undefined) {
  if (jqid == undefined) return;
  $(".search-results").html("").fadeIn();

  if (results.length == 0) {
    $(".search-results").html("No places found");
  }

  results.forEach((result) => {
    let place = places.filter((x) => x.id == result)[0];
    $(".search-results").append(`
      <div data-placeId="${place.id}"
           onclick="select('${place.id}', '${jqid}')">
        ${place.shortName ?? place.id} - ${place.displayName ?? place.longName}
      </div>
    `);
  });

  let firstResult = results[0];

  $("#" + jqid).off("keyup");
  $("#" + jqid).off("keydown");
  $("#" + jqid).off("blur");

  $("#" + jqid).on("keyup", function (e) {
    if (e.key === "Enter") {
      console.log("HIGHLIGHTED", highlightedResult, highlightedIndex);
      select(highlightedResult ?? firstResult, jqid, "ENTER");
      document.getElementById(jqid)?.blur();
    }
  });

  $("#" + jqid).on("keydown", function (e) {
    console.log(e.key);
    if (e.key === "ArrowDown") {
      highlightedIndex++;
      console.log(highlightedIndex);
    } else if (e.key === "ArrowUp") {
      highlightedIndex--;
      console.log(highlightedIndex);
    }

    if (highlightedIndex < -1) {
      console.log("WRAPD");
      highlightedIndex = results.length - 1;
      console.log(highlightedIndex);
    }

    if (highlightedIndex > results.length - 1) {
      console.log("WRAPU");
      highlightedIndex = -1;
    }

    if (highlightedIndex >= 0) {
      $(".search-results").children().removeClass("isHighlighted");
      $(".search-results")
        .children()
        .eq(highlightedIndex)
        .addClass("isHighlighted");
      highlightedResult = $(".isHighlighted").attr("data-placeId");
      console.log(highlightedResult);
      // $(".isHighlighted")[0].scrollIntoView(false);
      $("html, body").animate(
        {
          scrollTop: -(
            window.innerHeight / 2 -
            ($(".isHighlighted").offset()?.top ?? 0)
          ),
        },
        50
      );
    } else {
      $(".search-results").children().removeClass("isHighlighted");
      highlightedResult = undefined;
      window.scrollTo(0, 0);
    }
  });

  $("#" + jqid).on("blur", function () {
    setTimeout(function () {
      $(".search-results").css("display", "none");
      console.log($(".search-results").children().length);
      if ($(".search-results").children().length > 0)
        select(highlightedResult ?? firstResult, jqid, "BLUR");
    }, 300);
  });
}

function select(placeId: string, jqid: string, source: string) {
  console.log("SELECT from", source, placeId, jqid);

  let place = places.filter((x) => x.id == placeId)[0];

  if (place == undefined) {
    $("#" + jqid).removeAttr("data");
    $(".search-results").html("").css("display", "none");
  } else {
    $("#" + jqid).html(
      (place.shortName ?? place.id) +
        " - " +
        (place.displayName ?? place.longName ?? place.id)
    );
    $("#" + jqid).attr("data", placeId);
    $(".search-results").html("").css("display", "none");
  }

  startSearch();
}

$("#selection-swap").on("click", function () {
  let from = $("#from");
  let to = $("#to");

  from.off("keyup");
  from.off("blur");

  to.off("keyup");
  to.off("blur");

  let fromid = from.attr("data") ?? "";
  let toid = to.attr("data") ?? "";
  let fromContent = from.html();
  let toContent = to.html();

  from.attr("data", toid);
  to.attr("data", fromid);
  from.html(toContent);
  to.html(fromContent);

  startSearch();
});

$("#air-toggle").on("click", function () {
  $(".air-menu").toggleClass("menuIsVisible");
  $("#air-toggle span").toggleClass("flip");
  if (!$(".air-menu").hasClass("menuIsVisible")) {
    startSearch();
  }
});

$(".search").on("focus", function () {
  setTimeout(function () {
    document.execCommand("selectAll", false, undefined);
  }, 10);
});
