type Nodes = {
  [key: string]: number
}

type PathHeap = Array<Array<string>>

type TimesMap = {
  [key: string]: Nodes
}

type Path = Array<string>

const WALKING_SPEED = 2
const MINECART_SPEED = 8

const EXTRA_TIME = 5


//short for peek, as in peek at the last value in array
function pee(arr: Array<string>) {
  return arr[arr.length - 1]
}

function sortedIndex(array: Array<Path>, value: number) {
  var low = 0,
    high = array.length;

  while (low < high) {
    var mid = low + high >>> 1;
    if (parseFloat(array[mid][0]) < value) low = mid + 1;
    else high = mid;
  }
  return low;
}

let timeMap: TimesMap = {}

function generateTimeMap() {

  for (let i in places) {
    for (let j in places) {

      let a = places[i]
      let b = places[j]


      if (timeMap[a.id] == undefined)
        timeMap[a.id] = {}

      if (a.x && a.z && b.x && b.z && a.id != b.id) {
        timeMap[a.id][b.id] = getWalkingTime(a.x, a.z, b.x, b.z)
      } else {
        timeMap[a.id][b.id] = Infinity
      }

    }
  }

  return timeMap
}

function getWalkingTime(x1: number, y1: number, x2: number, y2: number) {
  let y = x2 - x1;
  let x = y2 - y1;

  // 10 blocks is a buffer to prevent the algorithm from cutting "through" stops
  // so it will always be faster to just walk past
  return Math.ceil(Math.sqrt(x * x + y * y)) + 10 / WALKING_SPEED;
}

function manhattanDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.abs(x1 - x2 + y1 - y2)
}

function routeTime(route: Route) {
  if (route.mode == "MRT") {
    return timeMap[route.from][route.to] * (WALKING_SPEED / MINECART_SPEED)
  }
  else return 60
}

function getNeighbors(currentNode: string, currentTime: number) {
  let nearestNodes: Nodes = {}
  currentTime = parseFloat(currentTime as unknown as string)

  Object.assign(nearestNodes, timeMap[currentNode])

  for (let i in nearestNodes) {
    nearestNodes[i] += currentTime;
  }

  let possibleRoutes = routes.filter(x => x.from == currentNode)

  for (let i in possibleRoutes) {
    let current = possibleRoutes[i]
    let time = routeTime(current) + currentTime
    nearestNodes[current.to] = Math.min(time)
  }

  return nearestNodes
}

async function findShortestPath(startNode: string, endNode: string) {
  return new Promise(async resolve => {
    var startTime = performance.now()

    console.log(startNode, endNode)

    let visited: Nodes = { [startNode]: 0 } //visited
    let knownMinTimes: Nodes = { [startNode]: 0 }
    let heap: Array<Path> = [] //path heap
    let winners: Array<Path> = [] //successes
    let firstSuccessTime = Infinity

    //get max value
    let maxTime = timeMap[startNode][endNode]
    console.log("MAX TIME: ", maxTime)

    // get starting values
    let startingValues = getNeighbors(startNode, 0)
    // map them into the path heap
    for (let i in startingValues) {
      if (startingValues[i] < maxTime)
        heap.push([startingValues[i].toString(), i])
    }
    // sort the heap
    heap.sort((a, b) => (parseFloat(a[0]) > parseFloat(b[0])) ? 1 : -1)

    //get starting path and node
    let currentNode = pee(heap[0])

    //while searching
    let searching = true
    while (currentNode && searching && heap.length > 0) {
      // console.log("ping")

      // for the shortest path in Paths
      let path = heap.shift()
      //get time to current Node
      let currentTime = path ?.[0] || Infinity
      currentTime = parseFloat(currentTime as string)

      // last node is current node
      let currentNode: string = pee(path as Array<string>)

      // if we've reached the last node, add to success cases
      if (currentNode == endNode) {
        winners.push(path as Path)
        firstSuccessTime = Math.min(currentTime, firstSuccessTime)
        if (currentTime > firstSuccessTime + EXTRA_TIME) {
          searching = false

          var endTime = performance.now()
          console.log(`Search took ${endTime - startTime} milliseconds`)

          console.log(winners)
          resolve(winners)
          return
        }
      }

      //if the route is already failing, stop
      if (currentNode in visited && currentTime > visited[currentNode]) continue
      if (currentTime > maxTime + EXTRA_TIME) continue

      // update Max Value
      let newMax = currentTime + timeMap[currentNode][endNode]
      if (newMax < maxTime) {
        maxTime = newMax
        //let indexToCut = sortedIndex(heap, maxTime * 1.5)
        //heap = heap.slice(0, indexToCut)
      }

      //stop searching for more paths after a while
      if (currentTime > firstSuccessTime + EXTRA_TIME) {
        searching = false

        var endTime = performance.now()
        console.log(`Search took ${endTime - startTime} milliseconds`)

        console.log(winners)
        resolve(winners)
        return
      }

      // take the last node of path and generate all possible next steps
      let nextSteps = getNeighbors(currentNode, currentTime)
      for (let nextNode in nextSteps) {

        let nextTime = nextSteps[nextNode]
        // discard any that are longer than max time
        if (nextTime > maxTime + EXTRA_TIME) continue

        //only revisit if distance the same
        if (nextNode in visited) {
          if (nextTime > visited[nextNode]) {
            continue
          }
        }

        //also check known times
        if (knownMinTimes[nextNode] == undefined || nextTime <= knownMinTimes[nextNode]) {
          knownMinTimes[nextNode] = nextTime
        } else {
          continue
        }

        // add them to the stack in order of quickness
        let newPath: Path = [...path as Path, nextNode]
        newPath[0] = nextTime.toString()
        let indexToAddAt = sortedIndex(heap, nextTime)
        heap.splice(indexToAddAt, 0, newPath);
        console.log("child")
      }
      console.log("parent")

      //mark current node as visited
      visited[currentNode] = currentTime

    }

    console.log("EXITED")
    console.log("winners", winners)
    resolve(winners)

  })
}
