import { fabric } from "fabric"

import { WorldInfo } from "./worldInfoType"

// with full param names
function easeLinear(
  currentTime: number,
  startValue: number,
  changeInValue: number,
  duration: number
) {
  return startValue + (currentTime / duration) * changeInValue
}

let previousPlayers: string[] = []
let previousPlayerRects: Record<string, fabric.Image> = {}
let playerUUIDs: Record<string, string> = {}
let activeCanvas: fabric.Canvas | undefined

const canMoveCamera = () => {
  if (window.lastMapInteraction) {
    const now = new Date()
    const diff = now.getTime() - window.lastMapInteraction.getTime()
    if (diff < 10000) return false
  }
  return true
}

const zoomToPlayer = (x: number, z: number, canvas: fabric.Canvas) => {
  if (window.pointOfInterest) {
    return zoomToTwoPoints({ x, z }, window.pointOfInterest, canvas)
  }

  if (!(activeCanvas === canvas)) return
  if (!canMoveCamera()) return
  const duration = 5000
  const start = Date.now()
  const startZoom = canvas.getZoom()
  const startX = canvas.viewportTransform?.[4] ?? 0
  const startZ = canvas.viewportTransform?.[5] ?? 0
  const end = start + duration
  const endZoom = 1
  const endX = -x * endZoom + window.innerWidth / 2
  const endZ = -z * endZoom + window.innerHeight / 2
  const animate = () => {
    if (!canMoveCamera()) return
    const now = Date.now()
    const t = now - start
    const newX = easeLinear(t, startX, endX - startX, duration)
    const newZ = easeLinear(t, startZ, endZ - startZ, duration)
    const zoom = easeLinear(t, startZoom, endZoom - startZoom, duration)
    canvas.setZoom(zoom)
    const vpt = canvas.viewportTransform
    if (vpt) {
      vpt[4] = newX
      vpt[5] = newZ
    }
    if (now < end) {
      requestAnimationFrame(animate)
    }

    Object.values(previousPlayerRects).forEach(rect => {
      rect.setCoords()
    })
  }
  animate()
}

/**
 * given two points, zoom the canvas to fit them both
 */
const zoomToTwoPoints = (
  a: { x: number; z: number },
  b: { x: number; z: number },
  canvas: fabric.Canvas
) => {
  if (!(activeCanvas === canvas)) return
  if (!canMoveCamera()) return
  const padding = 100 / canvas.getZoom()
  const width = Math.abs(a.x - b.x) + padding * 2
  const height = Math.abs(a.z - b.z) + padding * 2
  const centerX = (a.x + b.x) / 2
  const centerZ = (a.z + b.z) / 2
  const endZoom = Math.min(
    canvas.getWidth() / width,
    canvas.getHeight() / height
  )
  const endX = -centerX * endZoom + window.innerWidth / 2
  const endZ = -centerZ * endZoom + window.innerHeight / 2
  const startZoom = canvas.getZoom()
  const vpt = canvas.viewportTransform
  if (!vpt) return
  const startX = vpt[4]
  const startZ = vpt[5]
  const duration = 5000
  const start = Date.now()
  const end = start + duration
  const animate = () => {
    if (!canMoveCamera()) return
    const now = Date.now()
    const t = now - start
    const newX = easeLinear(t, startX, endX - startX, duration)
    const newZ = easeLinear(t, startZ, endZ - startZ, duration)
    const zoom = easeLinear(t, startZoom, endZoom - startZoom, duration)
    canvas.setZoom(zoom)
    const vpt = canvas.viewportTransform
    if (vpt) {
      vpt[4] = newX
      vpt[5] = newZ
    }
    if (now < end) {
      requestAnimationFrame(animate)
    }
  }
  animate()
}

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
        window.following &&
        window.following.toLowerCase() === name.toLowerCase()

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
      if (!(activeCanvas === canvas)) return

      players.forEach(player => {
        if (!playerUUIDs[player.account]) return
        // if player already on map, update their position
        if (previousPlayerRects[player.account]) {
          if (isPlayerToFollow(player.account)) {
            zoomToPlayer(player.x, player.z, canvas)
          }

          let img = previousPlayerRects[player.account]

          // tween to new position over 5 seconds
          img.animate("left", player.x, {
            duration: 5000,
            easing: easeLinear,
            onChange: () => {
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

            // on click, follow player

            img.on("mousedown", event => {
              console.log("click", player.account)
              window.following = player.account
              window.lastMapInteraction = undefined
              zoomToPlayer(player.x, player.z, canvas)
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
            zoomToPlayer(player.x, player.z, canvas)
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
}

export default function renderPlayers(canvas: fabric.Canvas) {
  activeCanvas = canvas
  const int = setInterval(() => {
    updatePlayers(canvas)
  }, 5000)
  updatePlayers(canvas)

  return () => {
    activeCanvas = undefined
    previousPlayers = []
    previousPlayerRects = {}
    playerUUIDs = {}
    clearInterval(int)
  }
}
