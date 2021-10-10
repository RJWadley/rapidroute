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
function findShortestPath(startNode, endNode, allowedModes, dataCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            calculationWorker.postMessage(["calc", startNode, endNode, allowedModes]);
            calculationWorker.onmessage = function (e) {
                let code = e.data[0];
                if (code == "complete") {
                    console.log("COMPLETE");
                    resolve(e.data[1]);
                }
                if (code == "report") {
                    e.data.shift();
                    dataCallback(e.data);
                }
                if (code == "failed") {
                    reject();
                }
            };
        }));
    });
}
function generateTimeMaps(routes, places) {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        calculationWorker.postMessage(["genTimeMaps", routes, places]);
        calculationWorker.onmessage = function (e) {
            let code = e.data[0];
            if (code == "genTimeMaps")
                resolve(true);
        };
    }));
}
if (window.Worker) {
    var calculationWorker = new Worker('./dist/worker.js');
}
function startSearch() {
    let from = $("#from").attr("data");
    let to = $("#to").attr("data");
    if (from != undefined && to != undefined)
        //@ts-ignore
        findShortestPath(from, to).then(console.log());
}
//# sourceMappingURL=calc.js.map