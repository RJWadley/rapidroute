"use strict";
// @ts-ignore
var searchWorker = new FlexSearch.Index({
    tokenize: "reverse"
});
function normalize(str) {
    if (str == undefined)
        return undefined;
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function initSearch() {
    places.forEach(place => {
        var _a, _b, _c, _d;
        let searchable = normalize(((_a = place.displayName) !== null && _a !== void 0 ? _a : "") + " " +
            ((_b = place.shortName) !== null && _b !== void 0 ? _b : "") + " " +
            ((_c = place.longName) !== null && _c !== void 0 ? _c : "") + " " +
            ((_d = place.keywords) !== null && _d !== void 0 ? _d : "") + " " +
            place.world);
        searchWorker.add(place.id, searchable);
    });
    $(".search").on("keydown", function (e) {
        if (e.key == "Enter") {
            e.preventDefault();
            return;
        }
    });
    $(".search").on("input", function () {
        let content = $(this).html();
        let id = $(this).attr("id");
        let results = searchWorker.search(content, {
            suggest: true
        });
        updateSearchResults(results, id);
    });
}
function updateSearchResults(results, jqid) {
    if (jqid == undefined)
        return;
    $(".search-results").html("").fadeIn();
    if (results.length == 0) {
        $(".search-results").html("No places found");
    }
    results.forEach(result => {
        var _a;
        let place = places.filter(x => x.id == result)[0];
        $(".search-results").append(`
      <div onclick="select('${place.id}', '${jqid}')">
        ${place.id} - ${(_a = place.displayName) !== null && _a !== void 0 ? _a : place.longName}
      </div>
    `);
    });
    let firstResult = results[0];
    $("#" + jqid).off('keyup');
    $("#" + jqid).off('blur');
    $("#" + jqid).on('keyup', function (e) {
        var _a;
        if (e.key === 'Enter') {
            select(firstResult, jqid);
            (_a = document.getElementById(jqid)) === null || _a === void 0 ? void 0 : _a.blur();
        }
    });
    $("#" + jqid).on('blur', function () {
        setTimeout(function () {
            console.log($(".search-results").children().length);
            if ($(".search-results").children().length > 0)
                select(firstResult, jqid);
        }, 100);
    });
}
function select(placeId, jqid) {
    var _a, _b;
    let place = places.filter(x => x.id == placeId)[0];
    if (place == undefined) {
        $("#" + jqid).removeAttr("data");
        $(".search-results").html("").css("display", "none");
    }
    else {
        $("#" + jqid).html((_b = (_a = place.displayName) !== null && _a !== void 0 ? _a : place.longName) !== null && _b !== void 0 ? _b : place.id);
        $("#" + jqid).attr("data", placeId);
        $(".search-results").html("").css("display", "none");
    }
    startSearch();
}
$("#selection-swap").on("click", function () {
    var _a, _b;
    let from = $("#from");
    let to = $("#to");
    from.off('keyup');
    from.off('blur');
    to.off('keyup');
    to.off('blur');
    let fromid = (_a = from.attr("data")) !== null && _a !== void 0 ? _a : "";
    let toid = (_b = to.attr("data")) !== null && _b !== void 0 ? _b : "";
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
        document.execCommand('selectAll', false, undefined);
    }, 10);
});
//# sourceMappingURL=search.js.map