var currentIterationCount = 0;
var nextIterationCount = 0;
var visited = []
var nextvisited = []

//search on message recieved
onmessage = function(e) {
  search(e.data[0],e.data[1],e.data[2],e.data[3])
}

//standard shuffle alg
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function search(from, to, places, routes) {
  //check for identical and empty
  if (to == from || to == "" || from == "") {
      postMessage("pass")
      return
  }

  //we shuffle so that the results won't appear in the same order every time
  //wouldn't want to accidentally bias any particular airline
  routes = shuffle(routes);

  routes = mergeSort(routes)

  let destinationReached = false
  let solutions = []
  let paths = []
  visited = []
  nextvisited = []

  //remove any null routes
  for (var i = routes.length - 1; i >=0 ; i--) {
    if (routes[i] == null || routes[i]["From"] == null ||
      routes[i]["To"] == null || routes[i]["From"] == undefined ||
        routes[i]["To"] == undefined) {
          routes.splice(i, 1);
        }
  }

  //prepopulate with starting routes
  let startingOptions = routes.filter(item => item["From"] == from)
  let finishingOptions = routes.filter(item => item["To"] == to)

  //add warp to spawn using /spawn
  //we only need these on the first round
  startingOptions.push({
    "From": from,
    "To": "X0",
    "Type": "the /spawn command"
  })
  startingOptions.push({
    "From": from,
    "To": "Z0",
    "Type": "the /spawn command"
  })

  if (finishingOptions.length == 0) {
    postMessage("Destination airport not supported")
    return
  }

  //check for one-stop solutions
  for (var i = 0; i < startingOptions.length; i++) {
   paths.push([startingOptions[i]])
   if (startingOptions[i].To == to) {
     destinationReached = true
     solutions.push([startingOptions[i]])
     postMessage(solutions)
   }
  }

  currentIterationCount = paths.length

  function discover() {

    if (paths.length == 0 || paths == undefined) {
      return
    }

    //get first path
    let firstPath = paths.shift()
    //get last item of first path
    let mostRecent = firstPath[firstPath.length-1]
    //get all possible next moves
    possibleMoves = routes.filter(item => item["From"] == mostRecent["To"])

    //for each possible move:
    possibleMoves.forEach((item, i) => {

      //if we have too many solutions then stop
      if (solutions.length >= 50) {
        console.log("done searching")
        return
      }
      //check if visited
      if (!visited.includes(item["To"])) {
        //if not, add to list of visited places
        nextvisited.push(item["To"])
        //generate whole path
        let newPath = [...firstPath]
        newPath.push(item)
        //check if completes route
        if (item["To"] == to) {

          //if it does, add it to solutions
          destinationReached = true
          solutions.push(newPath)
          postMessage(solutions)
        }
        //if the solution has not yet been reached
        if (destinationReached == false) {
          //add new path to path list
          nextIterationCount++
          paths.push(newPath)
        }
      }
    });

  }

  //main search loop
  // will search for a max of 500 moves (sorry, MRT stop Z501)
  for (var i = 0; i < 500; i++) {
    for (var j = 0; j < currentIterationCount; j++) {

      if (paths.length > 0) {

        //prioritize routes with gates here
        paths = mergeSort(paths) //merge sort
        //paths = paths.sort((a, b) => sortCheck(a, b)) //quicksort

        discover()
      }
    }

    currentIterationCount = nextIterationCount;
    nextIterationCount = 0;
    visited = [...visited, ...nextvisited]
    //visited = [] //uncomment for lols
    // and by lols I mean death
    // because your computer will catch on fire
    nextvisited = []
  }
  console.log("done searching")
  postMessage(solutions)

}

function sortCheck(a, b) {
  if (a instanceof Array && b instanceof Array) {
    aHasGates = (a[a.length-1]["hasFromGateData"] == undefined) ? false : true;
    bHasGates = (b[b.length-1]["hasFromGateData"] == undefined) ? false : true;

    if (aHasGates != bHasGates) {
      if (aHasGates) return true
      if (bHasGates) return false
    }
  } else if (b instanceof Array) {
    return false
  } else {
    aHasGates = (a["hasFromGateData"] == undefined) ? false : a["hasFromGateData"];
    bHasGates = (b["hasFromGateData"] == undefined) ? false : b["hasFromGateData"];

    if (aHasGates != bHasGates) {
      if (aHasGates) return true
      if (bHasGates) return false
    }
  }
  return true
}

// Merge the two arrays: left and right
function merge (left, right) {
  let resultArray = [], leftIndex = 0, rightIndex = 0;

  // We will concatenate values into the resultArray in order
  while (leftIndex < left.length && rightIndex < right.length) {
    if (sortCheck(left[leftIndex], right[rightIndex])) {
      resultArray.push(left[leftIndex]);
      leftIndex++; // move left array cursor
    } else {
      resultArray.push(right[rightIndex]);
      rightIndex++; // move right array cursor
    }
  }

  // We need to concat here because there will be one element remaining
  // from either left OR the right
  return resultArray
          .concat(left.slice(leftIndex))
          .concat(right.slice(rightIndex));
}

// Merge Sort Implentation (Recursion)
function mergeSort (unsortedArray) {
  // No need to sort the array if the array only has one element or empty
  if (unsortedArray.length <= 1) {
    return unsortedArray;
  }
  // In order to divide the array in half, we need to figure out the middle
  const middle = Math.floor(unsortedArray.length / 2);

  // This is where we will be dividing the array into left and right
  const left = unsortedArray.slice(0, middle);
  const right = unsortedArray.slice(middle);

  // Using recursion to combine the left and right
  return merge(
    mergeSort(left), mergeSort(right)
  );
}
