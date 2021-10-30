"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var allToResults = $("<div><div>Start Typing...</div></div>");
var allFromResults = $("<div><div>Start Typing...</div></div>");
// @ts-ignore
var searchWorker = new FlexSearch.Index({
    tokenize: "reverse",
    charset: "latin:advanced",
});
// @ts-ignore
var strictSearchWorker = new FlexSearch.Index({
    tokenize: "strict",
});
function normalize(str) {
    if (str == undefined)
        return undefined;
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function initSearch() {
    places.forEach((place) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
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
        allToResults.append(`
      <div data-placeId="${place.id}"
           onmousedown="select('${place.id}', 'to', 'click')">
        ${(_e = place.shortName) !== null && _e !== void 0 ? _e : place.id} - ${(_f = place.displayName) !== null && _f !== void 0 ? _f : place.longName}
      </div>
    `);
        allFromResults.append(`
      <div data-placeId="${place.id}"
           onmousedown="select('${place.id}', 'from', 'click')">
        ${(_g = place.shortName) !== null && _g !== void 0 ? _g : place.id} - ${(_h = place.displayName) !== null && _h !== void 0 ? _h : place.longName}
      </div>
    `);
    });
    $(".search").on("input focus", function () {
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
            updateSearchResults(["ShowAllResults"], id);
            return;
        }
        let strictResults = strictSearchWorker.search(content, {
            suggest: true,
            limit: 200,
        });
        let results = searchWorker.search(content, {
            suggest: true,
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
        updateSearchResults(results, id);
    });
}
let highlightedResult = undefined;
let highlightedIndex = -1;
function updateSearchResults(results, jqid) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (jqid == undefined)
            return;
        $(".search-results").fadeIn();
        if (results.length == 0) {
            $(".search-results").html("No places found");
            return;
        }
        let firstResult = results[0];
        if (results[0] == "ShowAllResults") {
            yield pause(10);
            if (((_a = document === null || document === void 0 ? void 0 : document.activeElement) === null || _a === void 0 ? void 0 : _a.id) != jqid)
                return;
            firstResult = "";
            $(jqid).attr("data-dest", "");
            if (jqid == "from") {
                $(".search-results")
                    .html("")
                    .append(allFromResults.clone().children())
                    .fadeIn();
            }
            else {
                $(".search-results")
                    .html("")
                    .append(allToResults.clone().children())
                    .fadeIn();
            }
        }
        else {
            $(".search-results").html("");
            results.forEach((result) => {
                var _a, _b;
                let place = places.filter((x) => x.id == result)[0];
                $(".search-results").append(`
        <div data-placeId="${place.id}"
             onmousedown="select('${place.id}', '${jqid}', 'click')">
          ${(_a = place.shortName) !== null && _a !== void 0 ? _a : place.id} - ${(_b = place.displayName) !== null && _b !== void 0 ? _b : place.longName}
        </div>
      `);
            });
        }
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
                highlightedIndex = $(".search-results").children().length - 1;
            }
            if (highlightedIndex > $(".search-results").children().length - 1) {
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
                if ($(".search-results").children().length > 0)
                    select(highlightedResult !== null && highlightedResult !== void 0 ? highlightedResult : firstResult, jqid, "BLUR");
            }, 1);
        });
        $(".search-results div").on("mousedown", function () {
            console.log("CLICKED");
        });
    });
}
function select(placeId, jqid, source) {
    var _a, _b, _c;
    console.log("select", placeId, source);
    $("spacer").css("height", "0");
    $("#" + jqid).off("blur");
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
    }, 100);
});
//# sourceMappingURL=search.js.map