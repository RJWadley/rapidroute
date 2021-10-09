"use strict";
// @ts-ignore
var searchWorker = new FlexSearch.Index({
    tokenize: "reverse",
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
    $(".search").on("input", function () {
        let results = searchWorker.search($(this).val(), {
            suggest: true
        });
        updateSearchResults(results, $(this).attr("id"));
    });
}
function updateSearchResults(results, jqid) {
    if (jqid == undefined)
        return;
    $(".search-results").html("");
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
        if (e.key === 'Enter') {
            select(firstResult, jqid);
        }
    });
    $("#" + jqid).on('blur', function (e) {
        select(firstResult, jqid);
    });
}
function select(placeId, jqid) {
    var _a, _b;
    let place = places.filter(x => x.id == placeId)[0];
    if (place == undefined) {
        $("#" + jqid).removeAttr("data");
        $(".search-results").html("");
    }
    else {
        $("#" + jqid).val((_b = (_a = place.displayName) !== null && _a !== void 0 ? _a : place.longName) !== null && _b !== void 0 ? _b : place.id);
        $("#" + jqid).attr("data", placeId);
        $(".search-results").html("");
    }
}
//# sourceMappingURL=search.js.map