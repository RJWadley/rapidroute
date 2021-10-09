type SWCode = "calc" | "cancel" | "report" | "complete" | "exited" | "genTimeMaps"

async function findShortestPath(startNode: string, endNode: string, allowedModes: Array<Mode>, dataCallback: Function) {
  return new Promise(async resolve => {
    calculationWorker.postMessage(["calc", startNode, endNode, allowedModes])
    calculationWorker.onmessage = function(e) {
      let code = e.data[0]
      if (code == "complete") {
        console.log("COMPLETE")
        resolve(e.data[1])
      }
      if (code == "report") {
        e.data.shift()
        dataCallback(e.data)
      }
    }
  })
}

function generateTimeMaps(routes: Array<Route>, places: Array<Place>) {
  return new Promise(async resolve => {
    calculationWorker.postMessage(["genTimeMaps", routes, places])
    calculationWorker.onmessage = function(e) {
      let code = e.data[0]
      if (code == "genTimeMaps") resolve(true)
    }
  })
}

if (window.Worker) {

  var calculationWorker = new Worker('./dist/worker.js');

}
