import { fabric } from "fabric"

import { MineTools } from "types/MineTools"
import { getLocal, session } from "utils/localUtils"

import { WorldInfo } from "./worldInfoType"
import { easeLinear, updateActiveCanvas, zoomToPlayer } from "./zoomTo"

let previousPlayers: string[] = []
let previousPlayerRects: Record<string, fabric.Image> = {}
let playerUUIDs: Record<string, string> = {}
let activeCanvas: fabric.Canvas | undefined

const updatePlayers = (canvas: fabric.Canvas) => {
  const imageWidth = () => 3 * Math.max(5, 10 * canvas.getZoom())

  fetch(
    "https://cors.mrtrapidroute.com/?https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json"
  )
    .then(response => response.json())
    .then(async (data: WorldInfo) => {
      if (!(activeCanvas === canvas)) return

      const players = data.players.filter(x => x.world === "new")

      // if account matches, follow player
      const isPlayerToFollow = (name: string) =>
        session.following &&
        session.following.toLowerCase() === name.toLowerCase()

      const allProms = players.map(
        player =>
          !playerUUIDs[player.account] &&
          fetch(`https://api.minetools.eu/uuid/${player.account}`)
            .then(response => response.json())
            .then((uuidData: MineTools) => {
              if (uuidData.id) playerUUIDs[player.account] = uuidData.id
            })
      )

      await Promise.allSettled(allProms)
      if (!(activeCanvas === canvas)) return

      if (!getLocal("selectedPlayer")) session.lastKnownLocation = undefined
      players.forEach(player => {
        if (
          player.account.toLowerCase() ===
          getLocal("selectedPlayer")?.toString().toLowerCase()
        ) {
          session.lastKnownLocation = { x: player.x, z: player.z }
        }

        if (!playerUUIDs[player.account]) return
        // if player already on map, update their position
        if (previousPlayerRects[player.account]) {
          if (isPlayerToFollow(player.account)) {
            zoomToPlayer(player.x, player.z, canvas, previousPlayerRects)
          }

          const img = previousPlayerRects[player.account]

          // tween to new position over 5 seconds
          img.animate("left", player.x, {
            duration: 5000,
            easing: easeLinear,
            onChange: () => {
              if (!(activeCanvas === canvas)) return
              img.scaleToWidth(imageWidth())
              img.scaleToHeight(imageWidth())
              canvas.requestRenderAll()
            },
          })
          previousPlayerRects[player.account].animate("top", player.z, {
            duration: 5000,
            easing: easeLinear,
          })
        } else {
          // otherwise, add them to the map
          const playerImageURL = `https://crafatar.com/avatars/${
            playerUUIDs[player.account]
          }?overlay=true&size=512`

          // create a rect with the image
          fabric.Image.fromURL(playerImageURL, img => {
            if (!(activeCanvas === canvas)) return
            img.set({
              left: player.x,
              top: player.z,
              selectable: false,
              originX: "center",
              originY: "center",
              hoverCursor: "pointer",
            })
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

                ctx.font = `${fontSize}px Inter`
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

            // on click, follow player

            img.on("mousedown", () => {
              session.following = player.account
              session.lastMapInteraction = undefined
              const top = img.top ?? 0
              const left = img.left ?? 0
              zoomToPlayer(left, top, canvas, previousPlayerRects)
            })

            // for the first five seconds, update image width every frame
            const start = Date.now()
            const end = start + 5000
            const updateWidth = () => {
              img.scaleToWidth(imageWidth())
              img.scaleToHeight(imageWidth())
              if (Date.now() < end) requestAnimationFrame(updateWidth)
            }
            updateWidth()
          })

          // center on player
          if (isPlayerToFollow(player.account)) {
            zoomToPlayer(player.x, player.z, canvas, previousPlayerRects)
          }
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
    .catch(err => {
      console.error("Error fetching playerlist", err)
    })
}

export default function renderPlayers(canvas: fabric.Canvas) {
  activeCanvas = canvas
  updateActiveCanvas(canvas)
  const int = setInterval(() => {
    updatePlayers(canvas)
  }, 5000)
  updatePlayers(canvas)

  return () => {
    activeCanvas = undefined
    previousPlayers = []
    Object.values(previousPlayerRects).forEach(player => {
      canvas.remove(player)
    })
    previousPlayerRects = {}
    playerUUIDs = {}
    clearInterval(int)
  }
}
