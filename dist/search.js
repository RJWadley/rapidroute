"use strict";
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
function normalize(str) {
    if (str == undefined)
        return undefined;
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function initSearch() {
    places.forEach((place) => {
        var _a, _b, _c, _d;
        let searchable = normalize(((_a = place.displayName) !== null && _a !== void 0 ? _a : "") +
            " " +
            ((_b = place.shortName) !== null && _b !== void 0 ? _b : "") +
            " " +
            ((_c = place.longName) !== null && _c !== void 0 ? _c : "") +
            " " +
            ((_d = place.keywords) !== null && _d !== void 0 ? _d : "") +
            " " +
            place.world);
        searchWorker.add(place.id, searchable);
        strictSearchWorker.add(place.id, searchable);
    });
    $(".search").on("input click", function () {
        var _a;
        let content = $(this).html();
        let id = $(this).attr("id");
        highlightedIndex = -1;
        if (window.innerWidth < 500 && highlightedIndex == -1) {
            let elmnt = document.getElementsByClassName("selection-container")[0];
            console.log(elmnt);
            elmnt === null || elmnt === void 0 ? void 0 : elmnt.scrollIntoView({ behavior: "smooth" });
            $(".spacer").css("height", "1000px");
        }
        let parser = new DOMParser();
        let doc = parser.parseFromString(content, "text/html");
        content = (_a = doc.body.textContent) !== null && _a !== void 0 ? _a : "";
        // @ts-ignore
        // the following line does absolutely nothing at all
        if (nothing)
            nothing(content);
        if (content == "") {
            $(this).attr("data-dest", "");
            $(".search-results").html("Start typing...").fadeIn();
            $(this).on("blur", function () {
                setTimeout(function () {
                    $(".search-results").css("display", "none");
                }, 300);
            });
            return;
        }
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
        results = results.sort((x) => {
            return places.filter((z) => z.id == x)[0].type == "town" ? -1 : 0;
        });
        results = results.sort((x) => {
            return x.toUpperCase() === content.toUpperCase() ? -1 : 0;
        });
        // if (content == "") {
        //   places.forEach((place) => {
        //     results.push(place.id);
        //   });
        // }
        updateSearchResults(results, id);
    });
}
let highlightedResult = undefined;
let highlightedIndex = -1;
function updateSearchResults(results, jqid) {
    if (jqid == undefined)
        return;
    $(".search-results").html("").fadeIn();
    if (results.length == 0) {
        $(".search-results").html("No places found");
    }
    results.forEach((result) => {
        var _a, _b;
        let place = places.filter((x) => x.id == result)[0];
        $(".search-results").append(`
      <div data-placeId="${place.id}"
           onclick="select('${place.id}', '${jqid}')">
        ${(_a = place.shortName) !== null && _a !== void 0 ? _a : place.id} - ${(_b = place.displayName) !== null && _b !== void 0 ? _b : place.longName}
      </div>
    `);
    });
    let firstResult = results[0];
    $("#" + jqid).off("keyup");
    $("#" + jqid).off("keydown");
    $("#" + jqid).off("blur");
    $("#" + jqid).on("keyup", function (e) {
        var _a;
        if (e.key === "Enter") {
            select(highlightedResult !== null && highlightedResult !== void 0 ? highlightedResult : firstResult, jqid, "ENTER");
            (_a = document.getElementById(jqid)) === null || _a === void 0 ? void 0 : _a.blur();
        }
    });
    $("#" + jqid).on("keydown", function (e) {
        var _a, _b;
        if (e.key === "ArrowDown") {
            highlightedIndex++;
        }
        else if (e.key === "ArrowUp") {
            highlightedIndex--;
        }
        if (highlightedIndex < -1) {
            highlightedIndex = results.length - 1;
        }
        if (highlightedIndex > results.length - 1) {
            highlightedIndex = -1;
        }
        if (highlightedIndex >= 0) {
            $(".search-results").children().removeClass("isHighlighted");
            $(".search-results")
                .children()
                .eq(highlightedIndex)
                .addClass("isHighlighted");
            highlightedResult = $(".isHighlighted").attr("data-placeId");
            // $(".isHighlighted")[0].scrollIntoView(false);
            $("html, body").animate({
                scrollTop: -(window.innerHeight / 2 -
                    ((_b = (_a = $(".isHighlighted").offset()) === null || _a === void 0 ? void 0 : _a.top) !== null && _b !== void 0 ? _b : 0)),
            }, 50);
        }
        else if (window.innerWidth >= 500) {
            $(".search-results").children().removeClass("isHighlighted");
            highlightedResult = undefined;
            window.scrollTo(0, 0);
        }
    });
    $("#" + jqid).on("blur", function () {
        setTimeout(function () {
            $(".search-results").css("display", "none");
            if ($(".search-results").children().length > 0)
                select(highlightedResult !== null && highlightedResult !== void 0 ? highlightedResult : firstResult, jqid, "BLUR");
        }, 300);
    });
}
function select(placeId, jqid, source) {
    var _a, _b, _c;
    $("spacer").css("height", "0");
    let place = places.filter((x) => x.id == placeId)[0];
    if (place == undefined) {
        $("#" + jqid).removeAttr("data-dest");
        $(".search-results").html("").css("display", "none");
    }
    else {
        $("#" + jqid).html(((_a = place.shortName) !== null && _a !== void 0 ? _a : place.id) +
            " - " +
            ((_c = (_b = place.displayName) !== null && _b !== void 0 ? _b : place.longName) !== null && _c !== void 0 ? _c : place.id));
        $("#" + jqid).attr("data-dest", placeId);
        $(".search-results").html("").css("display", "none");
    }
    startSearch();
}
$("#selection-swap").on("click", function () {
    var _a, _b;
    let from = $("#from");
    let to = $("#to");
    from.off("keyup");
    from.off("blur");
    to.off("keyup");
    to.off("blur");
    let fromid = (_a = from.attr("data-dest")) !== null && _a !== void 0 ? _a : "";
    let toid = (_b = to.attr("data-dest")) !== null && _b !== void 0 ? _b : "";
    let fromContent = from.html();
    let toContent = to.html();
    from.attr("data-dest", toid);
    to.attr("data-dest", fromid);
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
//# sourceMappingURL=search.js.map