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
function setItem(name, value) {
    //stringify then compress
    let compressed = LZString.compressToUTF16(JSON.stringify(value));
    //store it
    localStorage.setItem(name, compressed);
    sessionStorage.setItem(name, JSON.stringify(value));
    //console.groupCollapsed("Data Set: " + name);
    //console.log(JSON.stringify(value));
    //console.groupEnd();
}
function getItem(name) {
    //if the item doesn't exist return null
    if (localStorage.getItem(name) == null) {
        return null;
    }
    //attempt to get from sessionStorage
    let data = JSON.parse(sessionStorage.getItem(name));
    if (data != null) {
        //console.groupCollapsed("[Session] Data Got: " + name);
        //console.log(JSON.stringify(data));
        //console.groupEnd();
        return data;
    }
    //decompress then parse then return
    data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(name)));
    //console.groupCollapsed("[Local] Data Got: " + name);
    //console.log(JSON.stringify(data));
    //console.groupEnd();
    sessionStorage.setItem(name, JSON.stringify(data));
    return data;
}
function transpose(a) {
    // Calculate the width and height of the Array
    var w = a.length || 0;
    //calculate the max height of array
    let maxHeight = 0;
    a.forEach((item) => {
        if (item.length > maxHeight) {
            maxHeight = item.length;
        }
    });
    var h = maxHeight;
    // In case it is a zero matrix, no transpose routine needed.
    if (h === 0 || w === 0) {
        return [];
    }
    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];
    // Loop through every item in the outer array (height)
    for (i = 0; i < h; i++) {
        // Insert a new row (array)
        t[i] = [];
        // Loop through every item per item in outer array (width)
        for (j = 0; j < w; j++) {
            // Save transposed data.
            t[i][j] = a[j][i];
        }
    }
    return t;
}
// Warn if overriding existing method
//@ts-ignore
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
//@ts-ignore
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;
    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });
function a11yClick(event) {
    if (event.type === "click") {
        return true;
    }
    else if (event.type === "keypress") {
        var code = event.charCode || event.keyCode;
        if (code === 32 || code === 13) {
            return true;
        }
    }
    else {
        return false;
    }
}
function safe(provider) {
    if (provider == undefined)
        return undefined;
    let result = provider.replace(/ /g, "-");
    result = result.replace(/[^a-zA-Z0-9-]/g, "");
    return result;
}
function pause(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
function asyncSortPlaces() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            function onmessage(e) {
                let places = e.data[0];
                let routes = e.data[1];
                places = places.sort(function (a, b) {
                    return routes.filter((x) => x.to == a.id).length +
                        routes.filter((x) => x.to == a.id).length <
                        routes.filter((x) => x.to == b.id).length +
                            routes.filter((x) => x.to == b.id).length
                        ? 1
                        : -1;
                });
                postMessage(places);
            }
            let worker = new Worker(URL.createObjectURL(new Blob(["onmessage = " + onmessage.toString()])));
            worker.onmessage = function (e) {
                places = e.data;
                resolve(places);
            };
            worker.postMessage([places, routes]);
        });
    });
}
//# sourceMappingURL=util.js.map