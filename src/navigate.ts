
interface Phrase {
  place: string
  distance: number
  spoken: boolean
  phrase: string
}


let voices = window.speechSynthesis.getVoices();
let loop: any
let route: Array<string>
let phrases: Array<Phrase>
let progress: number
const NAV_WALKING_SPEED = 2;
const NAV_MINECART_SPEED = 8;

function startNavigation(inRoute: Array<string>) {

  speakText("Starting navigation");

  inRoute = inRoute ?? ['WN43', 'WN44', 'WN45', 'A56', 'A55', 'A53']


  let firstPlace = places.filter(x => x.id == inRoute[0])[0]
  let secondPlace = places.filter(x => x.id == inRoute[1])[0]
  let firstRoute = routes.filter(x => x.from == inRoute[0] && x.to == inRoute[1])[0]

  if (firstRoute ?.mode == "MRT") {

    let firstProvider = providers.filter(x => x.name == firstRoute ?.provider)[0]
    let direction = getDirection(firstPlace.x, firstPlace.z, secondPlace.x, secondPlace.z)
    if (direction) direction += "bound"

    speakText("Proceed to " + firstPlace.id + ", " + (firstPlace.displayName ??
      firstPlace.longName) + ", then take the " +
      (firstProvider.displayName ?? firstProvider.name ?? "") + ", " +
      (direction ?? "") + " towards " + secondPlace.id + ", " +
      (secondPlace.displayName ?? secondPlace.longName ?? ""))
  } else {
    speakText("Proceed to " + firstPlace.id + ", " + (firstPlace.displayName ??
      firstPlace.longName))
  }

  route = inRoute
  phrases = []
  progress = 0

  let mrtPassAlong: string | undefined = undefined;
  route.forEach((placeId, i) => {

    if (i + 2 > route.length) {

      let place = places.filter(x => x.id == placeId)[0]

      if (place.type == "MRT" && route[i - 1].substr(0, 1) == route[i].substr(0, 1)) {
        phrases.push({
          place: place.id,
          distance: 1000,
          spoken: false,
          phrase: "In two minutes, you will reach your destination"
        })

        phrases.push({
          place: place.id,
          distance: 300,
          spoken: false,
          phrase: "At the next stop, you will reach your destination"
        })

        phrases.push({
          place: place.id,
          distance: 50,
          spoken: false,
          phrase: "You have reached your destination, " + place.id + ", " + (place.displayName ?? place.longName ?? "")
        })
      }

      console.log("DEST")
      return
    }

    let possibleRoutes = routes.filter(x => x.from == placeId && x.to == route[i + 1])
    possibleRoutes = possibleRoutes.filter(x => allowedModes.includes(x.mode))

    let from = places.filter(x => x.id == placeId)[0]
    let to = places.filter(x => x.id == route[i + 1])[0]

    if (possibleRoutes.length == 0) {

      if (from.type == "MRT" && to.type == "MRT") {

        if (i == 0) console.log("First!")

        if (route[i + 2] == undefined && route[i + 1].substr(0, 1) != route[i].substr(0, 1)) {

          let phrase = "transfer to your destination."

          phrases.push({
            place: from.id,
            distance: 1000,
            spoken: false,
            phrase: "In two minutes, " + phrase
          })

          phrases.push({
            place: from.id,
            distance: 300,
            spoken: false,
            phrase: "At the next stop, " + phrase
          })

          phrases.push({
            place: from.id,
            distance: 50,
            spoken: false,
            phrase: phrase
          })

          return

        }

        let nextRoute = routes.filter(x => x.from == to.id && x.to == route[i + 2])[0]
        let nextPlace = places.filter(x => x.id == route[i + 2])[0]
        if (nextRoute == undefined) {
          console.log(from, to)
          return
        }
        let transferToProvider = providers.filter(x => x.name == nextRoute.provider)[0]
        let direction = getDirection(to.x, to.z, nextPlace.x, nextPlace.z)

        if (direction) direction += "bound"

        let phrase = "transfer to the " + (direction ?? "") + " " +
          (transferToProvider.displayName ?? transferToProvider.name) +
          ", towards " + nextPlace.id + ", " + (nextPlace.displayName ?? nextPlace.longName ?? "")

        phrases.push({
          place: from.id,
          distance: 1000,
          spoken: false,
          phrase: "In two minutes, " + phrase
        })

        phrases.push({
          place: from.id,
          distance: 300,
          spoken: false,
          phrase: "At the next stop, " + phrase
        })

        phrases.push({
          place: from.id,
          distance: 50,
          spoken: false,
          phrase: phrase
        })

        console.log("transfer", from, to)
        return
      }

      console.log("walk", from, to, undefined)
      return
    }

    // collapse MRT routes
    let nextPossibleRoutes = routes.filter(x => x.from == route[i + 1] && x.to == route[i + 2])
    if (possibleRoutes[0] ?.mode == "MRT" && nextPossibleRoutes[0] ?.mode == "MRT") {
      if (placeId.charAt(0) == route[i + 2].charAt(0)) {
        if (mrtPassAlong == undefined)
          mrtPassAlong = placeId
        return
      }
    }

    if (mrtPassAlong != undefined) {

      let route = possibleRoutes[0]

      from = places.filter(x => x.id == mrtPassAlong)[0]

      console.log("MRT (passed)", from, to, route)
      mrtPassAlong = undefined
      return
    }

    if (possibleRoutes[0].mode == "MRT") {

      let route = possibleRoutes[0]

      //MRT Stops always have coords

      console.log("MRT (single)", from, to, route)
      return
    }

    if (possibleRoutes.length == 1) {

      let route = possibleRoutes[0]

      if (route == undefined || from == undefined || to == undefined)
        throw new Error("Cannot navigate flight")

      console.log("largeFlight", from, to, route)
      return
    }

    console.log("flightHeader", from, to)

    possibleRoutes.forEach(flight => {
      console.log("smallFlight", from, to, flight)

    })

  });


  console.log("START")
  navigationLoop()
  loop = setInterval(navigationLoop, 5000)

}

let isSpeaking = false
let speakQueue: Array<string> = []
function speakText(
  text: string) {

  console.log("SPEAK NOW", text)

  if (speakQueue.length == 0 && isSpeaking == false) {
    console.log("Speak CANCELLING PREEMPTIVELY")
    //gah the speechSynthesis api is the worst
    speechSynthesis.cancel();

    speakQueue.push(text)
    triggerSpeakQueue()

  } else {
    speakQueue.push(text)

  }

}

function triggerSpeakQueue() {

  let text = speakQueue[0]

  if (text == undefined) return

  let speakInterval = setInterval(function(){
    if  (isSpeaking == false) {
      console.log("Has not spoken yet, retrying")
      speechSynthesis.cancel();
      triggerSpeakQueue()
    }
  },3000)

  voices = window.speechSynthesis.getVoices();
  voices = voices.filter(x => x.name.toLowerCase().indexOf("english") != -1)
  console.log(voices)
  var msg = new SpeechSynthesisUtterance();
  msg.voice = voices[6]
  msg.volume = 1; // 0 to 1
  msg.rate = 1; // 0.1 to 10
  msg.pitch = 1; //0 to 2
  msg.text = text;
  msg.lang = 'en-US';
  msg.onend = function(e) {
    console.log('Speak Finished in ' + e.elapsedTime + ' mseconds.');
    isSpeaking = false
    speakQueue.shift()
    clearInterval(speakInterval)
    triggerSpeakQueue()
  };
  msg.onstart = function(e) {
    isSpeaking = true
    console.log('Speak Started in ' + e.elapsedTime + ' mseconds.');
  };

  msg.onerror = function(event) {
    console.log('Speak An error has occurred with the speech synthesis: ' + event.error);
    isSpeaking = false

    speakQueue.shift()
    triggerSpeakQueue()
  }

  speechSynthesis.speak(msg);

}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  let x = x2 - x1;
  let y = y2 - y1;
  let distance = Math.ceil(Math.sqrt(x * x + y * y))
  return distance
}

function getDirection(x1: number | undefined, z1: number | undefined, x2: number | undefined, z2: number | undefined) {

  if (x1 == undefined || x2 == undefined || z1 == undefined || z2 == undefined) return undefined

  let x = x2 - x1;
  let z = -(z2 - z1);

  let direction = Math.atan2(x, z) / Math.PI * 180

  direction += 45
  if (direction < 0) direction += 360

  if (direction < 90) {
    return "North"
  }
  if (direction < 180) {
    return "East"
  }
  if (direction < 270) {
    return "South"
  }
  return "West"

}

function navigationLoop() {

  console.log("loop")

  fetch(`https://thingproxy.freeboard.io/fetch/https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json`)
    .then(response => {
      return response.json();
    }).then(res => {

      let data: any = res

      let player = data.players.filter((x: any) => x.name == "Scarycrumb45")[0]

      if (player == undefined) {
        console.log("Player not found")
        return
      }
      //tODO wait for player

      // let routePlaces = places.filter(x => route.includes(x.id))
      // let closestPlace = routePlaces[0]
      // let timeToClosest = Infinity;
      //
      // routePlaces.forEach(place => {
      //   let oldTime = getDistance(closestPlace.x ?? 999999, closestPlace.z ?? 999999, player.x, player.z)
      //   let newTime = getDistance(place.x ?? 999999, place.z ?? 999999, player.x, player.z)
      //
      //   if (newTime < oldTime) {
      //     console.log("CLOSER " + place.id)
      //     closestPlace = place
      //     timeToClosest = newTime
      //   }
      // })

      let phraseCount = 0
      let shouldSkip = false

      phrases.forEach(phrase => {

        if (shouldSkip) return

        let place = places.filter(x => x.id == phrase.place)[0]
        if (place.x == undefined || place.z == undefined) return
        let distance = getDistance(player.x, player.z, place.x, place.z)

        console.log(distance)

        if (distance < phrase.distance && phrase.spoken == false) {
          speakText(phrase.phrase)
          phrase.spoken = true
        }

        if (phrase.spoken == false) shouldSkip = true

        if (phrase.spoken) phraseCount++

      })

      if (phraseCount == phrases.length) {
        speakText("Navigation complete")
        clearInterval(loop)
      }

      // console.log(closestPlace)
      // readText("Closest place is " + closestPlace.id + ", " + (closestPlace.displayName ?? closestPlace.longName ?? ""))

    })


}
