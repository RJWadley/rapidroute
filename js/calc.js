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

  //add warp to spawn using /spawn
  //we only need these on the first round
  routes.unshift({
    "From": from,
    "To": "X0",
    "Type": "the /spawn command"
  })
  routes.unshift({
    "From": from,
    "To": "Z0",
    "Type": "the /spawn command"
  })

  //prepopulate with starting routes
  startingOptions = []
  routes.forEach((item, i) => {
    if (item["From"] == from) startingOptions.push(i)
  });

  let finishingOptions = routes.filter(item => item["To"] == to)

  if (finishingOptions.length == 0) {
    postMessage("Destination airport not supported")
    return
  }

  //check for one-stop solutions
  for (var i = 0; i < startingOptions.length; i++) {
   paths.push([startingOptions[i]])
   if (routes[startingOptions[i]].To == to) {
     destinationReached = true
     solutions.push([startingOptions[i]])
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
    //possibleMoves = routes.filter(item => item["From"] == routes[mostRecent]["To"])

    //for each route:
    routes.forEach((item, i) => {

      //check if valid move
      if (item["From"] != routes[mostRecent]["To"]) return

      //if we have too many solutions then stop
      //check if visited
      if (!visited.includes(item["To"])) {
        //if not, add to list of visited places
        nextvisited.push(item["To"])
        //generate whole path
        let newPath = [...firstPath]
        newPath.push(i)
        //check if completes route
        if (item["To"] == to) {
          postMessage("found")
          //if it does, add it to solutions
          destinationReached = true
          solutions.push(newPath)
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
  sendResults(solutions, routes)

}

function sendResults(solutions, routes) {
  let sortKeys = []
  solutions.forEach((solution, i) => {
    gatesCount = 0;
    solution.forEach((item, i) => {
      solution[i] = routes[solution[i]]
      if (solution[i].hasFromGateData) {
        gatesCount += 2;
      }
      if (solution[i].hasToGateData) {
        gatesCount++;
      }
      if (solution[i].Type == "MRT") {
        gatesCount += 2;
      }
    });

    let key = -(solution.length  - (gatesCount * 0.99 / (solution.length * 3)))
    sortKeys.push(key)
  });

  solutions = mergeSort(solutions, sortKeys)[0]
  solutionskeys = mergeSort(solutions, sortKeys)[0]

  postMessage(solutions)
}

// Merge the two arrays: left and right
// takes two arrays of size two: [arrayToSort, sortKey]
function merge (left, right) {
  let resultArray = [], resultKeys = [], leftIndex = 0, rightIndex = 0;

  // We will concatenate values into the resultArray in order
  while (leftIndex < left[1].length && rightIndex < right[1].length) {
    if (left[1][leftIndex] > right[1][rightIndex]) {
      resultArray.push(left[0][leftIndex]);
      resultKeys.push(left[1][leftIndex]);
      leftIndex++; // move left array cursor
    } else {
      resultArray.push(right[0][rightIndex]);
      resultKeys.push(right[1][rightIndex]);
      rightIndex++; // move right array cursor
    }
  }

  // We need to concat here because there will be one element remaining
  // from either left OR the right
  returnArray = resultArray
    .concat(left[0].slice(leftIndex))
    .concat(right[0].slice(rightIndex));
  returnKeys = resultKeys
    .concat(left[1].slice(leftIndex))
    .concat(right[1].slice(rightIndex));

  return [returnArray, returnKeys];
}

// Merge Sort Implentation (Recursion)
function mergeSort (unsortedArray, sortKeys) {
  if (unsortedArray.length != sortKeys.length) {
    throw new Error('Keys length did not match array length!');
  }

  // No need to sort the array if the array only has one element or empty
  if (sortKeys.length <= 1) {
    return [unsortedArray, sortKeys];
  }

  // In order to divide the array in half, we need to figure out the middle
  const middle = Math.floor(sortKeys.length / 2);

  // This is where we will be dividing the array into left and right
  const left = unsortedArray.slice(0, middle);
  const right = unsortedArray.slice(middle);
  const leftKeys = sortKeys.slice(0, middle);
  const rightKeys = sortKeys.slice(middle);

  // Using recursion to combine the left and right
  return merge(
    mergeSort(left, leftKeys), mergeSort(right, rightKeys)
  );
}
