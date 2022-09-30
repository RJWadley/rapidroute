import { fabric } from "fabric"

import { WorldInfo } from "./worldInfoType"

function easeLinear(t: number, b: number, c: number, d: number) {
  return b + (t / d) * c
}

let previousPlayers = []
const previousPlayerRects: Record<string, fabric.Image> = {}
const playerUUIDs: Record<string, string> = {}
const updatePlayers = (canvas: fabric.Canvas) => {
  const imageWidth = () => 3 * Math.max(5, 10 * canvas.getZoom())

  fetch(
    "https://misty-rice-7487.rjwadley.workers.dev/?https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json"
  )
    .then(response => response.json())
    .then(async (data: WorldInfo) => {
      const { players } = data

      const allProms = players.map(
        player =>
          !playerUUIDs[player.name] &&
          fetch(`https://api.minetools.eu/uuid/${player.name}`)
            .then(response => response.json())
            .then(uuidData => {
              playerUUIDs[player.name] = uuidData.id
            })
      )

      await Promise.allSettled(allProms)

      previousPlayers = players.map(player => player.name)

      players.forEach(player => {
        if (!playerUUIDs[player.name]) return
        console.log("updating player", player.name)
        // if player already on map, update their position
        if (previousPlayerRects[player.name]) {
          // tween to new position over 5 seconds
          previousPlayerRects[player.name].animate("left", player.x, {
            duration: 5000,
            easing: easeLinear,
            onChange: () => canvas.requestRenderAll(),
          })
          previousPlayerRects[player.name].animate("top", player.z, {
            duration: 5000,
            easing: easeLinear,
            onChange: () => canvas.requestRenderAll(),
          })
        } else {
          console.log("creating new player", player.name)
          // otherwise, add them to the map
          const playerImageURL = `https://crafatar.com/avatars/${
            playerUUIDs[player.name]
          }?overlay=true&size=512`

          // create a rect with the image
          fabric.Image.fromURL(playerImageURL, img => {
            img.set({
              left: player.x,
              top: player.z,
              selectable: false,
              originX: "center",
              originY: "center",
            })
            img.scaleToWidth(imageWidth())
            img.scaleToHeight(imageWidth())
            canvas.add(img)
            previousPlayerRects[player.name] = img

            // on zoom, scale
            canvas.on("mouse:wheel", () => {
              img.scaleToWidth(imageWidth())
              img.scaleToHeight(imageWidth())
            })
            canvas.on("mouse:move", () => {
              img.scaleToWidth(imageWidth())
              img.scaleToHeight(imageWidth())
            })
          })
        }
      })

      // remove players that are no longer on the map
      const currentPlayers = players.map(player => player.name)
      const playersToRemove = previousPlayers.filter(
        player => !currentPlayers.includes(player)
      )
      playersToRemove.forEach(player => {
        canvas.remove(previousPlayerRects[player])
        delete previousPlayerRects[player]
      })
      previousPlayers = currentPlayers
    })
}

export default function renderPlayers(canvas: fabric.Canvas) {
  const int = setInterval(() => {
    updatePlayers(canvas)
  }, 5000)
  updatePlayers(canvas)

  return () => clearInterval(int)
}
