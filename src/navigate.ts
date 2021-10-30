interface Phrase {
  place: string;
  distance: number;
  spoken: boolean;
  phrase: string;
}

let voices = window.speechSynthesis.getVoices();
let loop: any;
let globalRoute: Array<string>;
let phrases: Array<Phrase>;
let progress: number;
const NAV_WALKING_SPEED = 2;
const NAV_MINECART_SPEED = 8;

function startNavigation(route: Array<string>, resultId: number) {
  //@ts-ignore
  mixpanel.track("Navigate", { from: route[0], to: route[route.length - 1] });

  console.log("GENERATING PHRASES");
  speakText("Starting navigation");
  phrases = [];
  globalRoute = [...route];
  let afterWarping = "";

  initNavUI(route, resultId);

  for (let i = 1; i <= route.length - 1; i++) {
    if (route.length == 2) {
      console.log("ROUTE OF LENGTH 2");
      route.push(route[1]);
    }

    let prevPlace = places.filter((x) => x.id == route[i - 1])[0];
    let currentPlace = places.filter((x) => x.id == route[i])[0];
    let nextPlace = places.filter((x) => x.id == route[i + 1])[0];
    let routesBefore = routes.filter(
      (x) =>
        x.from == prevPlace?.id &&
        x.to == currentPlace.id &&
        allowedModes.includes(x.mode)
    );
    let routesAfter = routes.filter(
      (x) =>
        x.from == currentPlace.id &&
        x.to == nextPlace?.id &&
        allowedModes.includes(x.mode)
    );

    //first set
    if (i == 1) {
      if (
        allowedModes.includes("spawnWarp") &&
        spawnWarps.includes(currentPlace.id)
      ) {
        afterWarping = "After warping, ";
        speakText("Warp to Spawn");
        if (currentPlace.id != "Spawn")
          speakText(
            "Then, warp to " +
              (currentPlace.shortName ?? currentPlace.id) +
              ", " +
              (currentPlace.displayName ?? currentPlace.longName)
          );
        phrases.push({
          place: "Spawn",
          distance: 500,
          spoken: false,
          phrase:
            "Welcome to Central City. Take the warp to " +
            (currentPlace.shortName ?? currentPlace.id) +
            ", " +
            (currentPlace.displayName ?? currentPlace.longName),
        });
        route.shift();
        i--;
        continue;
      }
      if (prevPlace?.type == "town") {
        route.shift();
        i--;
        continue;
      }
      if (routesBefore[0]?.mode == "MRT") {
        //first set
        // if first route is mrt
        let firstProvider = providers.filter(
          (x) => x.name == routesBefore[0].provider
        )[0];
        let direction = getDirection(
          prevPlace.x,
          prevPlace.z,
          currentPlace.x,
          currentPlace.z
        );
        if (direction) direction += "bound";

        speakText(
          afterWarping +
            "Proceed to " +
            prevPlace.id +
            ", " +
            (prevPlace.displayName ?? prevPlace.longName)
        );

        phrases.push({
          place: prevPlace.id,
          distance: 500,
          spoken: false,
          phrase:
            "Take the " +
            (firstProvider.displayName ?? firstProvider.name ?? "") +
            ", " +
            (direction ?? "") +
            " towards " +
            currentPlace.id +
            ", " +
            (currentPlace.displayName ?? currentPlace.longName ?? ""),
        });
      } else if (routesBefore[0]?.mode == "flight") {
        //first route is a  flight

        let then = "";
        if (routesBefore.length == 1) {
          let firstRoute = routesBefore[0];

          //get blurb
          let blurbPrefix;
          switch (firstRoute.mode) {
            case "flight":
              blurbPrefix = "Flight";
              break;
            case "seaplane":
              blurbPrefix = "Seaplane flight";
              break;
            case "heli":
              blurbPrefix = "Helicopter flight";
              break;
            default:
              blurbPrefix = "";
          }

          let codeshare;
          if (
            firstRoute.number != undefined &&
            firstRoute.provider != undefined
          )
            codeshare = codeshares?.[firstRoute.provider]?.[firstRoute.number];

          then =
            ", then take " +
            (codeshare ?? firstRoute.provider) +
            ", " +
            blurbPrefix +
            " " +
            firstRoute.number +
            ", to " +
            (currentPlace.shortName ?? "") +
            ", " +
            (currentPlace.displayName ?? currentPlace.longName ?? "");

          if (firstRoute.fromGate != undefined && firstRoute.fromGate != "") {
            then += ", at Gate " + firstRoute.fromGate;
          }

          console.log("THEN", then);
        } else {
          then =
            ", then take a flight to " +
            (currentPlace.shortName ?? "") +
            ", " +
            (currentPlace.displayName ?? currentPlace.longName ?? "") +
            ". You have multiple flight options. ";

          routesBefore.forEach((flight, i) => {
            if (i == routesBefore.length - 1) {
              then += " and ";
            }

            //get blurb
            let blurbPrefix;
            switch (flight.mode) {
              case "flight":
                blurbPrefix = "Flight";
                break;
              case "seaplane":
                blurbPrefix = "Seaplane flight";
                break;
              case "heli":
                blurbPrefix = "Helicopter flight";
                break;
              default:
                blurbPrefix = "";
            }

            let codeshare;
            if (flight.number != undefined && flight.provider != undefined)
              codeshare = codeshares?.[flight.provider]?.[flight.number];

            then +=
              (codeshare ?? flight.provider) +
              ", " +
              blurbPrefix +
              " " +
              flight.number;

            if (flight.fromGate != undefined && flight.fromGate != "") {
              then += ", at Gate " + flight.fromGate;
            }

            then += "... ";
            //done
          });
        }

        speakText(
          afterWarping +
            "proceed to " +
            prevPlace.id +
            ", " +
            (prevPlace.displayName ?? prevPlace.longName) +
            " " +
            then
        );

        phrases.push({
          place: prevPlace.id,
          distance: 500,
          spoken: false,
          phrase: then.substr(6),
        });
      } else {
        //walk
        speakText(
          afterWarping +
            "Proceed to " +
            (prevPlace.shortName ?? prevPlace.id) +
            ", " +
            (prevPlace.displayName ?? prevPlace.longName) +
            ", then walk to " +
            (currentPlace.shortName ?? currentPlace.id) +
            ", " +
            (currentPlace.displayName ?? currentPlace.longName)
        );

        phrases.push({
          place: prevPlace.id,
          distance: 500,
          spoken: false,
          phrase:
            "walk to " +
            (currentPlace.shortName ?? currentPlace.id) +
            ", " +
            (currentPlace.displayName ?? currentPlace.longName),
        });
        route.shift();
        i--;
      }
    }

    if (i + 1 == route.length - 1) {
      //last set
      console.log("Last Set");
      //approaching via MRT
      if (prevPlace.type == "MRT" && currentPlace.type == "MRT") {
        if (routesAfter.length == 0 && nextPlace.id != currentPlace.id) {
          if (
            nextPlace.x != undefined &&
            nextPlace.z != undefined &&
            currentPlace.x != undefined &&
            currentPlace.z != undefined &&
            getDistance(
              nextPlace.x,
              nextPlace.z,
              currentPlace.x,
              currentPlace.z
            ) < 250 &&
            nextPlace.type == "MRT"
          ) {
            //phrases for reaching the end of a route via MRT
            phrases.push({
              place: currentPlace.id,
              distance: 1000,
              spoken: false,
              phrase:
                "In two minutes, transfer to your destination, " +
                nextPlace.id +
                ", " +
                (nextPlace.displayName ?? nextPlace.longName ?? ""),
            });

            phrases.push({
              place: currentPlace.id,
              distance: 300,
              spoken: false,
              phrase: "At the next stop, transfer to your destination",
            });

            phrases.push({
              place: currentPlace.id,
              distance: 50,
              spoken: false,
              phrase:
                "Transfer to your destination, " +
                nextPlace.id +
                ", " +
                (nextPlace.displayName ?? nextPlace.longName ?? ""),
            });

            continue;
          } else {
            //phrases for reaching the end of a route via MRT
            phrases.push({
              place: currentPlace.id,
              distance: 1000,
              spoken: false,
              phrase:
                "In two minutes, walk to your destination, " +
                (nextPlace.shortName ?? nextPlace.id ?? "") +
                ", " +
                (nextPlace.displayName ?? nextPlace.longName ?? ""),
            });

            phrases.push({
              place: currentPlace.id,
              distance: 300,
              spoken: false,
              phrase: "At the next stop, walk to your destination",
            });

            phrases.push({
              place: currentPlace.id,
              distance: 50,
              spoken: false,
              phrase:
                "Walk to your destination, " +
                (nextPlace.shortName ?? nextPlace.id ?? "") +
                ", " +
                (nextPlace.displayName ?? nextPlace.longName ?? ""),
            });
            continue;
          }
        } else {
          //arrive via MRT
          console.log(
            "3x At",
            nextPlace.id,
            "you will reach your destination",
            nextPlace.id
          );
          //phrases for reaching the end of a route via MRT
          phrases.push({
            place: nextPlace.id,
            distance: 1000,
            spoken: false,
            phrase:
              "In two minutes, you will reach your destination, " +
              nextPlace.id +
              ", " +
              (nextPlace.displayName ?? nextPlace.longName ?? ""),
          });

          phrases.push({
            place: nextPlace.id,
            distance: 300,
            spoken: false,
            phrase: "At the next stop, you will reach your destination",
          });

          phrases.push({
            place: nextPlace.id,
            distance: 50,
            spoken: false,
            phrase:
              "You have reached your destination, " +
              nextPlace.id +
              ", " +
              (nextPlace.displayName ?? nextPlace.longName ?? ""),
          });
        }
      } else if (
        currentPlace.type == "airport" &&
        nextPlace.type == "airport"
      ) {
        setTimeout(function () {
          phrases.push({
            place: nextPlace.id,
            distance: -1,
            spoken: false,
            phrase:
              "You have reached your destination, " +
              (nextPlace.shortName ?? nextPlace.id) +
              ", " +
              (nextPlace.displayName ?? nextPlace.longName ?? ""),
          });
        }, 10);
      }
    }

    if (nextPlace == undefined) continue;

    //approaching via MRT
    if (prevPlace.type == "MRT" && currentPlace.type == "MRT") {
      //transfer or walk to next station
      if (nextPlace.type == "MRT" && routesBefore.length == 0) {
        console.log(
          "3x At",
          prevPlace.id,
          "transfer or walk to ",
          currentPlace.id
        );

        let provider = routes.filter((x) => x.from == currentPlace.id)[0]
          .provider;
        let transferToProvider = providers.filter((x) => x.name == provider)[0];

        let direction = getDirection(
          currentPlace.x,
          currentPlace.z,
          nextPlace.x,
          nextPlace.z
        );

        if (direction) direction += "bound";

        if (
          currentPlace.x != undefined &&
          currentPlace.z != undefined &&
          prevPlace.x != undefined &&
          prevPlace.z != undefined &&
          getDistance(
            currentPlace.x,
            currentPlace.z,
            prevPlace.x,
            prevPlace.z
          ) < 250
        ) {
          let phrase =
            "transfer to the " +
            (direction ?? "") +
            " " +
            (transferToProvider.displayName ?? transferToProvider.name) +
            ", towards " +
            nextPlace.id +
            ", " +
            (nextPlace.displayName ?? nextPlace.longName ?? "");

          if (i != 0) {
            phrases.push({
              place: prevPlace.id,
              distance: 1000,
              spoken: false,
              phrase: "In two minutes, " + phrase,
            });

            phrases.push({
              place: prevPlace.id,
              distance: 300,
              spoken: false,
              phrase: "At the next stop, " + phrase,
            });
          }

          phrases.push({
            place: prevPlace.id,
            distance: 50,
            spoken: false,
            phrase: phrase,
          });
        } else {
          let phrase =
            "walk to " +
            currentPlace.id +
            ", " +
            (currentPlace.displayName ?? currentPlace.longName ?? "") +
            ", then take the " +
            (direction ?? "") +
            " " +
            (transferToProvider.displayName ?? transferToProvider.name) +
            ", towards " +
            nextPlace.id +
            ", " +
            (nextPlace.displayName ?? nextPlace.longName ?? "");

          phrases.push({
            place: prevPlace.id,
            distance: 1000,
            spoken: false,
            phrase: "In two minutes, " + phrase,
          });

          phrases.push({
            place: prevPlace.id,
            distance: 300,
            spoken: false,
            phrase: "At the next stop, " + phrase,
          });

          phrases.push({
            place: prevPlace.id,
            distance: 50,
            spoken: false,
            phrase: phrase,
          });

          phrases.push({
            place: currentPlace.id,
            distance: 500,
            spoken: false,
            phrase:
              "Take the " +
              (transferToProvider.displayName ??
                transferToProvider.name ??
                "") +
              ", " +
              (direction ?? "") +
              " towards " +
              nextPlace.id +
              ", " +
              (nextPlace.displayName ?? nextPlace.longName ?? ""),
          });
        }
        continue;
      }

      //transfer to airport
      if (nextPlace.type == "airport") {
        console.log(
          "3x At",
          currentPlace.id,
          "walk to ",
          nextPlace.id,
          "then catch flight"
        );
        let then = "";

        //jump one ahead to get flight data
        if (route[i + 2] != undefined) {
          prevPlace = places.filter((x) => x.id == route[i])[0];
          currentPlace = places.filter((x) => x.id == route[i + 1])[0];
          nextPlace = places.filter((x) => x.id == route[i + 2])[0];
          routesAfter = routes.filter(
            (x) => x.from == currentPlace.id && x.to == nextPlace.id
          );
        }

        if (routesAfter.length > 0) {
          if (routesAfter.length == 1) {
            let nextRoute = routesAfter[0];

            //get blurb
            let blurbPrefix;
            switch (nextRoute.mode) {
              case "flight":
                blurbPrefix = "Flight";
                break;
              case "seaplane":
                blurbPrefix = "Seaplane flight";
                break;
              case "heli":
                blurbPrefix = "Helicopter flight";
                break;
              default:
                blurbPrefix = "";
            }

            let codeshare;
            if (
              nextRoute.number != undefined &&
              nextRoute.provider != undefined
            )
              codeshare = codeshares?.[nextRoute.provider]?.[nextRoute.number];

            then =
              ", then take " +
              (codeshare ?? nextRoute.provider) +
              ", " +
              blurbPrefix +
              " " +
              nextRoute.number +
              ", to " +
              (nextPlace.shortName ?? "") +
              ", " +
              (nextPlace.displayName ?? nextPlace.longName ?? "");

            if (nextRoute.fromGate != undefined && nextRoute.fromGate != "") {
              then += ", at Gate " + nextRoute.fromGate;
            }

            console.log("THEN", then);
          } else {
            then =
              ", then take a flight to " +
              (nextPlace.shortName ?? "") +
              ", " +
              (nextPlace.displayName ?? nextPlace.longName ?? "") +
              ". You have multiple flight options. ";

            routesAfter.forEach((flight, i) => {
              if (i == routesAfter.length - 1) {
                then += " and ";
              }

              //get blurb
              let blurbPrefix;
              switch (flight.mode) {
                case "flight":
                  blurbPrefix = "Flight";
                  break;
                case "seaplane":
                  blurbPrefix = "Seaplane flight";
                  break;
                case "heli":
                  blurbPrefix = "Helicopter flight";
                  break;
                default:
                  blurbPrefix = "";
              }

              let codeshare;
              if (flight.number != undefined && flight.provider != undefined)
                codeshare = codeshares?.[flight.provider]?.[flight.number];

              then +=
                (codeshare ?? flight.provider) +
                ", " +
                blurbPrefix +
                " " +
                flight.number;

              if (flight.fromGate != undefined && flight.fromGate != "") {
                then += ", at Gate " + flight.fromGate;
              }

              then += "... ";
              //done
            });
          }
        }

        let phrase =
          "walk to " +
          (currentPlace.shortName ?? "") +
          ", " +
          (currentPlace.displayName ?? currentPlace.longName);

        phrases.push({
          place: prevPlace.id,
          distance: 1000,
          spoken: false,
          phrase: "In two minutes, " + phrase + then,
        });

        phrases.push({
          place: prevPlace.id,
          distance: 300,
          spoken: false,
          phrase: "At the next stop, " + phrase,
        });

        phrases.push({
          place: prevPlace.id,
          distance: 50,
          spoken: false,
          phrase: phrase + then,
        });

        continue;
      }

      //walk to next spot
      if (routesAfter.length == 0) {
        console.log("3x At", currentPlace.id, "walk to ", nextPlace.id);
        continue;
      }

      //otherwise normal mrt, just stay silent
      console.log("stay on mrt");
      continue;
    }

    //arriving by plane
    if (
      prevPlace.type == "airport" &&
      currentPlace.type == "airport" &&
      nextPlace.type != "MRT"
    ) {
      let then = "";

      if (routesAfter.length > 0) {
        if (routesAfter.length == 1) {
          let nextRoute = routesAfter[0];
          //get blurb
          let blurbPrefix;
          switch (nextRoute.mode) {
            case "flight":
              blurbPrefix = "Flight";
              break;
            case "seaplane":
              blurbPrefix = "Seaplane flight";
              break;
            case "heli":
              blurbPrefix = "Helicopter flight";
              break;
            default:
              blurbPrefix = "";
          }

          let codeshare;
          if (nextRoute.number != undefined && nextRoute.provider != undefined)
            codeshare = codeshares?.[nextRoute.provider]?.[nextRoute.number];

          then =
            "take " +
            (codeshare ?? nextRoute.provider) +
            ", " +
            blurbPrefix +
            " " +
            nextRoute.number +
            ", to " +
            (nextPlace.shortName ?? "") +
            ", " +
            (nextPlace.displayName ?? nextPlace.longName ?? "");

          if (nextRoute.fromGate != undefined && nextRoute.fromGate != "") {
            then += ", at Gate " + nextRoute.fromGate;
          }
        } else {
          then =
            "take a flight to " +
            (nextPlace.shortName ?? "") +
            ", " +
            (nextPlace.displayName ?? nextPlace.longName ?? "") +
            ". You have multiple flight options. ";

          routesAfter.forEach((flight, i) => {
            if (i == routesAfter.length - 1) {
              then += " and ";
            }

            //get blurb
            let blurbPrefix;
            switch (flight.mode) {
              case "flight":
                blurbPrefix = "Flight";
                break;
              case "seaplane":
                blurbPrefix = "Seaplane flight";
                break;
              case "heli":
                blurbPrefix = "Helicopter flight";
                break;
              default:
                blurbPrefix = "";
            }

            let codeshare;
            if (flight.number != undefined && flight.provider != undefined)
              codeshare = codeshares?.[flight.provider]?.[flight.number];

            then +=
              (codeshare ?? flight.provider) +
              ", " +
              blurbPrefix +
              " " +
              flight.number;

            if (flight.fromGate != undefined && flight.fromGate != "") {
              then += ", at Gate " + flight.fromGate;
            }

            then += "... ";
            //done
          });
        }
      } else {
        if (nextPlace.id == currentPlace.id) continue;
        then =
          "walk to " +
          (nextPlace.shortName ?? nextPlace.id) +
          ", " +
          (nextPlace.displayName ?? nextPlace.longName ?? "");
      }

      let phrase =
        "Welcome to " +
        (currentPlace.displayName ??
          currentPlace.longName ??
          currentPlace.shortName) +
        "... ";

      phrases.push({
        place: currentPlace.id,
        distance: -1,
        spoken: false,
        phrase: phrase + then,
      });

      console.log("flight");
    }

    if (prevPlace.type == "airport" && currentPlace.type == "MRT") {
      let provider = routes.filter((x) => x.from == currentPlace.id)[0]
        .provider;
      let transferToProvider = providers.filter((x) => x.name == provider)[0];

      let direction = getDirection(
        currentPlace.x,
        currentPlace.z,
        nextPlace.x,
        nextPlace.z
      );

      if (direction) direction += "bound";

      let then =
        "take the " +
        (direction ?? "") +
        " " +
        (transferToProvider.displayName ?? transferToProvider.name) +
        ", towards " +
        nextPlace.id +
        ", " +
        (nextPlace.displayName ?? nextPlace.longName ?? "");

      let phrase =
        "Welcome to " +
        (prevPlace.displayName ?? prevPlace.longName ?? prevPlace.shortName) +
        "... walk to " +
        (currentPlace.shortName ?? currentPlace.id) +
        ", " +
        (currentPlace.displayName ?? currentPlace.longName) +
        ", then ";

      phrases.push({
        place: prevPlace.id,
        distance: -1,
        spoken: false,
        phrase: phrase + then,
      });

      phrases.push({
        place: currentPlace.id,
        distance: 50,
        spoken: false,
        phrase: then,
      });
    }
  }

  clearInterval(loop);
  navigationLoop();
  loop = setInterval(navigationLoop, 5000);
}

let instructionArray: JQuery<HTMLElement>;
function initNavUI(route: Array<string>, resultId: number) {
  console.log(route, resultId);

  instructionArray = $(".route").eq(0).children(".leg").clone();

  if (getItem("playername") == null || getItem("playername") == "") {
    setItem(
      "playername",
      prompt("Enter your Minecraft username (case-sensitive)")
    );
  }

  let playername = getItem("playername");

  //TODO FIX
  $(".nav-container").css("display", "grid");
  $(".nav-summary").children(".nav-summary-item").remove();
  $("body").css("overflow", "hidden");

  route.forEach((placeId) => {
    let place = places.filter((x) => x.id == placeId)[0];

    $(".nav-summary").append(`<div class="nav-summary-item">
      <p>
        <span>${place.shortName ?? place.id}</span>
         - ${place.displayName ?? place.longName ?? ""}
       </p>
    </div>`);
  });

  $(".playerhead img").attr(
    "src",
    "https://dynmap.minecartrapidtransit.net/tiles/faces/16x16/" +
      playername +
      ".png"
  );

  setTimeout(function () {
    $("#dynmap").attr(
      "src",
      `https://dynmap.minecartrapidtransit.net/?playername=${playername}&zoom=6`
    );
  }, 1000);
}

let isSpeaking = false;
let speakQueue: Array<string> = [];
function speakText(text: string) {
  console.log("SPEAK NOW", text);

  if (speakQueue.length == 0 && isSpeaking == false) {
    console.log("Speak CANCELLING PREEMPTIVELY");
    //gah the speechSynthesis api is the worst
    speechSynthesis.cancel();

    speakQueue.push(text);
    triggerSpeakQueue();
  } else {
    speakQueue.push(text);
  }
}

function triggerSpeakQueue() {
  let text = speakQueue[0];

  if (text == undefined) return;

  let speakInterval = setInterval(function () {
    if (isSpeaking == false) {
      console.log("Has not spoken yet, retrying");
      speechSynthesis.cancel();
      triggerSpeakQueue();
    }
  }, 3000);

  voices = window.speechSynthesis.getVoices();
  voices = voices.filter((x) => x.name.toLowerCase().indexOf("english") != -1);
  console.log(voices);
  var msg = new SpeechSynthesisUtterance();
  msg.voice = voices[6];
  msg.volume = 1; // 0 to 1
  msg.rate = 1; // 0.1 to 10
  msg.pitch = 1; //0 to 2
  msg.text = text;
  msg.lang = "en-US";
  msg.onend = function (e) {
    console.log("Speak Finished in " + e.elapsedTime + " mseconds.");
    isSpeaking = false;
    speakQueue.shift();
    clearInterval(speakInterval);
    triggerSpeakQueue();
  };
  msg.onstart = function (e) {
    isSpeaking = true;
    console.log("Speak Started in " + e.elapsedTime + " mseconds.");
  };

  msg.onerror = function (event) {
    console.log(
      "Speak An error has occurred with the speech synthesis: " + event.error
    );
    isSpeaking = false;

    speakQueue.shift();
    triggerSpeakQueue();
  };

  speechSynthesis.speak(msg);
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  let x = x2 - x1;
  let y = y2 - y1;
  let distance = Math.ceil(Math.sqrt(x * x + y * y));
  return distance;
}

function getDirection(
  x1: number | undefined,
  z1: number | undefined,
  x2: number | undefined,
  z2: number | undefined
) {
  if (x1 == undefined || x2 == undefined || z1 == undefined || z2 == undefined)
    return undefined;

  let x = x2 - x1;
  let z = -(z2 - z1);

  let direction = (Math.atan2(x, z) / Math.PI) * 180;

  direction += 45;
  if (direction < 0) direction += 360;

  if (direction < 90) {
    return "North";
  }
  if (direction < 180) {
    return "East";
  }
  if (direction < 270) {
    return "South";
  }
  return "West";
}

let lastPlayer: any;

function navigationLoop() {
  console.log("loop");

  fetch(
    `https://jsonp.afeld.me/?url=https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json`
  )
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      let data: any = res;

      let player = data.players.filter(
        (x: any) => x.name == getItem("playername")
      )[0];

      if (player == undefined) {
        console.log("Player not found");
        return;
      }

      let routePlaces = places.filter((x) => globalRoute.includes(x.id));

      let shortestDistance = Infinity;
      let offset = 0;
      globalRoute.forEach((placeId, i) => {
        if (i < 1) return;

        let place = places.filter((x) => x.id == placeId)[0];
        let prevPlace = places.filter((x) => x.id == globalRoute[i - 1])[0];

        if (place.x == undefined || place.z == undefined) return;
        if (prevPlace.x == undefined || prevPlace.z == undefined) return;

        let result =
          Math.atan2(prevPlace.z - player.z, prevPlace.x - player.x) -
          Math.atan2(place.z - player.z, place.x - player.x);
        result = result / Math.PI;
        console.log("ANGLE", place.id, prevPlace.id, result / Math.PI);

        let firstDistance = getDistance(
          player.x,
          player.z,
          prevPlace.x,
          prevPlace.z
        );
        let secondDistance = getDistance(player.x, player.z, place.x, place.z);

        if (
          Math.abs(result) > 0.4 ||
          firstDistance < 50 ||
          secondDistance < 50
        ) {
          if (firstDistance + secondDistance < shortestDistance) {
            shortestDistance = firstDistance + secondDistance;
            let ratio = (firstDistance / (firstDistance + secondDistance)) * 60;
            let startIndex = globalRoute.indexOf(prevPlace.id);

            offset = startIndex * 60 + ratio;
            offset += 25;

            console.log(
              "firstDistance, secondDistance",
              firstDistance,
              secondDistance
            );
            console.log("ratio, start, offset", ratio, startIndex, offset);
          }
        }
      });

      $(".playerhead").css("top", offset + "px");

      if (navigationCanScroll == true)
        $(".nav-summary").animate(
          {
            scrollTop: offset - 30,
          },
          5000,
          "linear"
        );

      let phrase = phrases[0];
      let place = places.filter((x) => x.id == phrase.place)[0];

      let instruction = instructionArray.filter(
        (i) => $(instructionArray[i]).attr("data-place") == phrase.place
      )[0];

      $(".nav-instruction").remove();
      $(".nav-container").append(
        $(instruction).addClass("nav-instruction").removeClass("no-shadow")
      );

      if (phrase.distance == -1) {
        if (lastPlayer == undefined) return;

        let distanceMoved = getDistance(
          player.x,
          player.z,
          lastPlayer.x,
          lastPlayer.z
        );

        if (distanceMoved > 2000) {
          console.log("MOVED A LOT, TRIGGERING PHRASE");
          if (place.x == undefined || place.z == undefined) {
            console.log("location not defined");
            alertSound.play();
            speakText(phrase.phrase);
            phrases.shift();
          } else {
            console.log("location defined");
            let distance = getDistance(player.x, player.z, place.x, place.z);
            console.log(distance);
            if (distance < 2000) {
              alertSound.play();
              speakText(phrase.phrase);
              phrases.shift();
            }
          }
        }
      } else {
        if (place.x == undefined || place.z == undefined) {
          console.log("UNREACHABLE PLACE");
          speakText(phrase.phrase);
          phrases.shift();
        } else {
          let distance = getDistance(player.x, player.z, place.x, place.z);

          if (distance < phrase.distance && phrase.spoken == false) {
            alertSound.play();
            speakText(phrase.phrase);
            phrases.shift();
          }
        }
      }

      if (0 == phrases.length) {
        alertSound.load();
        successSound.play();
        speakText("Navigation complete");
        clearInterval(loop);
      }

      lastPlayer = player;
    });
}

let navigationCanScroll = true;
let scrollTimeout: any;
$(".nav-summary").on(
  "mousedown wheel DOMMouseScroll mousewheel keyup touchmove",
  function () {
    $(this).stop();
    navigationCanScroll = false;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      navigationCanScroll = true;
    }, 10 * 1000);
  }
);

$(".exit-nav").on("click", function () {
  phrases = [];
  speakQueue = [];
  speechSynthesis.cancel();
  clearTimeout(loop);
  $(".nav-container").css("display", "none");
  $("body").css("overflow", "unset");
});

let successSound = new Audio("audio/complete.mp3");
let alertSound = new Audio("audio/alert.mp3");
