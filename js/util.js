function setItem(name, value) {
    //stringify then compress
    let compressed = LZString.compressToUTF16(JSON.stringify(value));
    //store it
    localStorage.setItem(name,compressed);
    console.groupCollapsed("Data Set");
    console.log(JSON.stringify(value));
    console.groupEnd();
}

function getItem(name) {
    //if the item doesn't exist return null
    if (localStorage.getItem(name) == null) {
        return null;
    }

    //decompress then parse then return
    let data = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(name)));
    console.groupCollapsed("Data Got");
    console.log(JSON.stringify(data));
    console.groupEnd();
    return data;
}
