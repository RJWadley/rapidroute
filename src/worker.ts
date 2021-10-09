let cancelCode = 0

onmessage = function(e) {
  console.log("MESSAGE RECIEVED")
  let data = e.data
  let code: SWCode = data.shift()

  if (code == "calc") {
    cancelCode++
    calculateRoute(data[0], data[1], cancelCode)
  }

  if (code == "genTimeMaps") {
    workerGenerateTimeMaps(data[0], data[1])
  }
}

interface MapNode {
  name: string,
  time: number
}

type Nodes = {
  [key: string]: number
}

type NodeHeap = Array<MapNode>

type Parents = {
  [key: string]: {
    time: number,
    parents: Array<string>
  }
}

type TimesMap = {
  [key in Mode]: {
    [key: string]: Nodes
  }
} | undefined

const WALKING_SPEED = 2
const MINECART_SPEED = 8

const EXTRA_TIME = 5

let localPlaces: Array<Place>;
let localRoutes: Array<Route>;

function sortedIndex(array: NodeHeap, value: number) {
  var low = 0,
    high = array.length;

  while (low < high) {
    var mid = low + high >>> 1;
    if (array[mid].time < value) low = mid + 1;
    else high = mid;
  }
  return low;
}

let timesMap: TimesMap = undefined

function workerGenerateTimeMaps(routesParam: any, placesParam: any) {

  localRoutes = routesParam
  localPlaces = placesParam

  timesMap = {
    walk: {},
    MRT: {},
    flight: {},
    heli: {},
    seaplane: {},
  }

  for (let i in localPlaces) {
    for (let j in localPlaces) {

      let a = localPlaces[i]
      let b = localPlaces[j]

      if (timesMap["walk"][a.id] == undefined)
        timesMap["walk"][a.id] = {}

      if (a.x && a.z && b.x && b.z && a.id != b.id) {
        timesMap["walk"][a.id][b.id] = getTravelTime(a.x, a.z, b.x, b.z, "walk")
      } else {
        timesMap["walk"][a.id][b.id] = Infinity
      }
    }
  }

  localRoutes.forEach(route => {
    if (timesMap ?.[route.mode][route.from] == undefined)
      timesMap![route.mode][route.from] = {}

    let time = routeTime(route)
    timesMap![route.mode][route.from][route.to] = time
  })

  console.log("time maps generated")
}

function getTravelTime(x1: number, y1: number, x2: number, y2: number, mode: Mode) {
  let y = x2 - x1;
  let x = y2 - y1;
  let distance = Math.ceil(Math.sqrt(x * x + y * y))

  if (mode == "walk") {
    return Math.max(distance / WALKING_SPEED, 10)
  } else if (mode == "MRT") {
    return distance / MINECART_SPEED
  } else {
    return 60 * 5
  }
}

function manhattanDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.abs(x1 - x2 + y1 - y2)
}

function routeTime(route: Route) {

  if (route.mode == "flight" || route.mode == "seaplane" || route.mode == "heli") return 60 * 5

  let from = localPlaces.filter(x => x.id == route.from)[0]
  let to = localPlaces.filter(x => x.id == route.to)[0]

  if (from == undefined || to == undefined) return Infinity
  if (from.x == undefined || from.z == undefined) return Infinity
  if (to.x == undefined || to.z == undefined) return Infinity

  if (route.mode == "MRT") return getTravelTime(from.x, from.z, to.x, to.z, "MRT")

  else return 60 * 5 //TODO CHANGE

}

function getNeighbors(currentNode: string, currentTime: number) {
  let nearestNodes: Nodes = {}
  currentTime = parseFloat(currentTime as unknown as string)

  if (timesMap == undefined) throw new Error("Times map is not defined")

  //TODO only keep shortest time

  Object.assign(nearestNodes, timesMap["walk"][currentNode])
  Object.assign(nearestNodes, timesMap["MRT"][currentNode])
  Object.assign(nearestNodes, timesMap["heli"][currentNode])
  Object.assign(nearestNodes, timesMap["seaplane"][currentNode])
  Object.assign(nearestNodes, timesMap["flight"][currentNode])

  for (let i in nearestNodes) {
    nearestNodes[i] += currentTime;
  }

  // let possibleRoutes = routes.filter(x => x.from == currentNode)
  //
  // for (let i in possibleRoutes) {
  //   let current = possibleRoutes[i]
  //   let time = routeTimeTODORENAME(current) + currentTime
  //   nearestNodes[current.to] = Math.min(time)
  // }

  return nearestNodes
}


function calculateRoute(startNode: string, endNode: string, localCancelCode: number) {

  if (startNode.substr(0, 1) == '#') {
    let coords = startNode.substring(1, startNode.length).split("+")
    timesMap!["walk"][startNode] = {}
    for (let i in localPlaces) {
      let place = localPlaces[i]
      if (place.z != undefined && place.x != undefined) {
        timesMap!["walk"][place.id][startNode] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk")
        timesMap!["walk"][startNode][place.id] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk")
      }
    }
  }
  if (endNode.substr(0, 1) == '#') {
    let coords = endNode.substring(1, startNode.length).split("+")
    timesMap!["walk"][endNode] = {}
    for (let i in localPlaces) {
      let place = localPlaces[i]
      if (place.z != undefined && place.x != undefined) {
        timesMap!["walk"][place.id][endNode] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk")
        timesMap!["walk"][endNode][place.id] = getTravelTime(place.x, place.z, parseInt(coords[0]), parseInt(coords[1]), "walk")
      }
    }
  }

  var startTime = performance.now()

  console.log(startNode, endNode, localCancelCode)

  let visited: Nodes = { [startNode]: 0 } //visited
  let knownMinTimes: Nodes = { [startNode]: 0 }
  let nodeHeap: NodeHeap = [] //path heap
  let parents: Parents = {}

  let finishTime = Infinity;

  //get max value
  let maxTime = timesMap ?.["walk"][startNode][endNode] ?? Infinity
  console.log("MAX TIME: ", maxTime)

  // get starting values
  let startingValues = getNeighbors(startNode, 0)
  // map them into the path heap
  for (let i in startingValues) {
    if (startingValues[i] < maxTime) {

      parents[i] = {
        time: startingValues[i],
        parents: [startNode]
      }

      nodeHeap.push({
        name: i,
        time: startingValues[i]
      })
    }
  }
  // sort the heap
  nodeHeap.sort((a, b) => (a.time > b.time) ? 1 : -1)

  //get starting path and node
  let currentNode = nodeHeap[0]

  //while searching
  while (currentNode && nodeHeap.length > 0) {

    // console.log("PING ", currentNode)

    if (localCancelCode < cancelCode) {
      return
    }

    // for the shortest path in Paths
    currentNode = nodeHeap.shift() ?? nodeHeap[0]
    if (currentNode == undefined) continue
    let currentTime = currentNode.time

    // if we've reached the last node we're done
    if (currentNode.name == endNode) {
      console.log("FOUND FINISH")
      finishTime = currentTime
    }

    //allow for multiple solutions
    if (currentTime > finishTime + EXTRA_TIME || nodeHeap.length == 0) {
      console.log("success", parents)
      var endTime = performance.now()
      console.log("Took", endTime - startTime)

      let paths: Array<Array<string>> = [[endNode]]
      let doneCounter = 0;

      for (let i = 0; i < 10000; i++) {

        if (doneCounter > paths.length) {
          i = 100000
        }

        if (paths[0][0] == startNode) {
          paths.push(paths.shift()!)
          doneCounter++
          continue
        }
        doneCounter = 0
        let currentPath = paths.shift()
        if (currentPath == undefined) continue

        let currentParents = parents[currentPath[0]].parents
        currentParents.forEach(node => {
          paths.push([node, ...currentPath!])
        });

      }

      console.log(paths)

      console.log("sending success")
      sendSuccess(paths)

      return
    }

    //if the route is already failing, stop
    if (currentNode.name in visited && currentTime > visited[currentNode.name]) continue
    if (currentTime > maxTime + EXTRA_TIME) continue

    // update Max Value
    let newMax = currentTime + (timesMap ?.["walk"][currentNode.name][endNode] ?? Infinity) //TODO shortest time map?
    if (newMax < maxTime) {
      maxTime = newMax
      //let indexToCut = sortedIndex(heap, maxTime * 1.5)
      //heap = heap.slice(0, indexToCut)
      console.log("NEW MAX")
      nodeHeap = nodeHeap.filter(x => x.time <= maxTime + EXTRA_TIME)
    }

    // take the last node of path and generate all possible next steps
    let nextSteps = getNeighbors(currentNode.name, currentTime)
    for (let nextNode in nextSteps) {

      if (nextNode == startNode) continue

      let nextTime = nextSteps[nextNode]
      // discard any that are longer than max time
      // console.log("discarding too long node  ", nextNode)
      if (nextTime > maxTime + EXTRA_TIME) continue

      //don't revisit nodes unless distance is same
      if (nextNode in visited) {
        if (visited[nextNode] + EXTRA_TIME < currentTime) {
          // console.log("discarding visited node  ", nextNode)
          continue
        }
      }
      //console.log(nextNode, nextTime, maxTime, nodeHeap.length)

      //also check known times
      if (knownMinTimes[nextNode] == undefined || nextTime <= knownMinTimes[nextNode]) {
        knownMinTimes[nextNode] = nextTime
        // console.log("shortest time found for ", nextNode)
      } else if (nextTime > knownMinTimes[nextNode] + EXTRA_TIME) {
        // console.log("node longer than shortest known time ", nextNode, knownMinTimes[nextNode], nextTime)
        continue
      }

      // console.log("adding ", nextNode)

      //take note of parents
      if (parents[nextNode] == undefined) {
        // console.log("creating parent for ", currentNode, nextNode)
        parents[nextNode] = {
          time: nextTime,
          parents: [currentNode.name]
        }
      } else {

        let fastestTime = parents[nextNode].time

        if (nextTime + EXTRA_TIME < fastestTime) {
          // console.log("shorter parent found for ", currentNode, nextNode, nextTime, fastestTime)
          parents[nextNode] = {
            parents: [currentNode.name],
            time: nextTime
          }
        } else if (nextTime < fastestTime + EXTRA_TIME) {
          if (!parents[nextNode].parents.includes(currentNode.name)) {
            parents[nextNode].parents.push(currentNode.name)
            // console.log("equal parent found for ", currentNode, nextNode, nextTime)
          }
        }
      }

      // console.log("queueing new node ", nextNode)

      // add them to the stack in order of quickness
      let newNode: MapNode = {
        name: nextNode,
        time: nextTime
      }
      let indexToAddAt = sortedIndex(nodeHeap, nextTime)
      nodeHeap.splice(indexToAddAt, 0, newNode);
    }

    //mark current node as visited
    visited[currentNode.name] = currentTime
  }

  console.log("EXITED")
}

function sendSuccess(dataToSend: any) {
  let message: SWCode = "complete"
  postMessage([message, dataToSend])
}
