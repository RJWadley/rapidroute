"use strict";
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
//# sourceMappingURL=util.js.map