var currentIterationCount = 0;
var nextIterationCount = 0;
var visited = []
var nextvisited = []

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
  console.log("starting search")

  //we shuffle so that the results won't appear in the same order every time
  //wouldn't want to accidentally bias any particular airline
  routes = shuffle(routes);

  let destinationReached = false
  let solutions = []
  let paths = []
  visited = []
  nextvisited = []
  //prepopulate with starting route
  let startingOptions = routes.filter(item => item["From"] == from)
  for (var i = 0; i < startingOptions.length; i++) {
   paths.push([startingOptions[i]])
   //check for direct flights
   if (startingOptions[i].To == to) {
     destinationReached = true
     solutions.push([startingOptions[i]])
     postMessage(solutions)
   }
  }
  currentIterationCount = paths.length

  function discover() {

    //get first path
    let firstPath = paths.shift()
    //get last item of first path
    let mostRecent = firstPath[firstPath.length-1]
    //get all possible next moves
    possibleMoves = routes;
    possibleMoves = possibleMoves.filter(item => item["From"] == mostRecent["To"])
    //for each possible move:
    possibleMoves.forEach((item, i) => {
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

  for (var i = 0; i < 500; i++) {
    for (var j = 0; j < currentIterationCount; j++) {
      if (paths.length > 0) {
        discover();
      }
    }
    currentIterationCount = nextIterationCount;
    nextIterationCount = 0;
    visited = [...visited, ...nextvisited]
    //visited = [] //uncomment for lols
    nextvisited = []
  }
  console.log("done calculating")
  postMessage(solutions)

}
