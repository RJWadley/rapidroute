function setItem(name: string, value: any) {
  //stringify then compress
  let compressed = LZString.compressToUTF16(JSON.stringify(value));
  //store it
  localStorage.setItem(name, compressed);
  sessionStorage.setItem(name, JSON.stringify(value));
  //console.groupCollapsed("Data Set: " + name);
  //console.log(JSON.stringify(value));
  //console.groupEnd();
}

function getItem(name: string) {
  //if the item doesn't exist return null
  if (localStorage.getItem(name) == null) {
    return null;
  }

  //attempt to get from sessionStorage
  let data = JSON.parse(sessionStorage.getItem(name)!);
  if (data != null) {
    //console.groupCollapsed("[Session] Data Got: " + name);
    //console.log(JSON.stringify(data));
    //console.groupEnd();
    return data;
  }

  //decompress then parse then return
  data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(name)!)!);
  //console.groupCollapsed("[Local] Data Got: " + name);
  //console.log(JSON.stringify(data));
  //console.groupEnd();
  sessionStorage.setItem(name, JSON.stringify(data));
  return data;
}

function transpose(a: Array<any>) {
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
  var i: number,
    j: number,
    t: Array<any> = [];

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
  console.warn(
    "Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."
  );
// attach the .equals method to Array's prototype to call it on any array
//@ts-ignore
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array) return false;

  // compare lengths - can save a lot of time
  if (this.length != array.length) return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

function a11yClick(event: any) {
  if (event.type === "click") {
    return true;
  } else if (event.type === "keypress") {
    var code = event.charCode || event.keyCode;
    if (code === 32 || code === 13) {
      return true;
    }
  } else {
    return false;
  }
}

function safe(provider: string | undefined) {
  if (provider == undefined) return undefined;
  let result = provider.replace(/ /g, "-");
  result = result.replace(/[^a-zA-Z0-9-]/g, "");
  return result;
}
