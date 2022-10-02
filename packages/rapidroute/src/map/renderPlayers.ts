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
      const players = data.players.filter(x => x.world === "new")

      const allProms = players.map(
        player =>
          !playerUUIDs[player.account] &&
          fetch(`https://api.minetools.eu/uuid/${player.account}`)
            .then(response => response.json())
            .then(uuidData => {
              playerUUIDs[player.account] = uuidData.id
            })
      )

      await Promise.allSettled(allProms)

      previousPlayers = players.map(player => player.account)

      players.forEach(player => {
        if (!playerUUIDs[player.account]) return
        // if player already on map, update their position
        if (previousPlayerRects[player.account]) {
          // tween to new position over 5 seconds
          previousPlayerRects[player.account].animate("left", player.x, {
            duration: 5000,
            easing: easeLinear,
            onChange: () => canvas.requestRenderAll(),
          })
          previousPlayerRects[player.account].animate("top", player.z, {
            duration: 5000,
            easing: easeLinear,
            onChange: () => canvas.requestRenderAll(),
          })
        } else {
          // otherwise, add them to the map
          const playerImageURL = `https://crafatar.com/avatars/${
            playerUUIDs[player.account]
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
            previousPlayerRects[player.account] = img

            // on zoom, scale
            canvas.on("mouse:wheel", () => {
              img.scaleToWidth(imageWidth())
              img.scaleToHeight(imageWidth())
            })
            canvas.on("mouse:move", () => {
              img.scaleToWidth(imageWidth())
              img.scaleToHeight(imageWidth())
            })

            canvas.on("after:render", () => {
              if (Object.values(previousPlayerRects).includes(img)) {
                // render a label above the player
                img.setCoords()
                const ctx = canvas.getContext()
                const fontSize = 15
                const padding = 5
                const cornerRadius = 10
                const bounds = img.getBoundingRect()
                const absoluteX = bounds.left + bounds.width / 2
                const absoluteY = bounds.top - padding - 10

                ctx.font = `${fontSize}px Arial`
                ctx.textAlign = "center"

                // fill a rect behind the text
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
                ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
                ctx.lineJoin = "round"
                ctx.lineWidth = cornerRadius
                ctx.fillRect(
                  absoluteX -
                    ctx.measureText(player.account).width / 2 -
                    padding +
                    cornerRadius / 2,
                  absoluteY - fontSize - padding + cornerRadius / 2,
                  ctx.measureText(player.account).width +
                    padding * 2 -
                    cornerRadius,
                  fontSize + padding - cornerRadius
                )
                ctx.strokeRect(
                  absoluteX -
                    ctx.measureText(player.account).width / 2 -
                    padding,
                  absoluteY - fontSize - padding,
                  ctx.measureText(player.account).width + padding * 2,
                  fontSize + padding
                )
                ctx.fillStyle = "white"
                ctx.fillText(player.account, absoluteX, absoluteY - padding)
              }
            })
          })
        }
      })

      // remove players that are no longer on the map
      const currentPlayers = players.map(player => player.account)
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
