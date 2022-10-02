import { fabric } from "fabric"

export default function setupPanAndZoom(canvas: fabric.Canvas) {
  // zooming
  canvas.on("mouse:wheel", opt => {
    window.lastMapInteraction = new Date()
    const delta = -opt.e.deltaY
    const zoom = canvas.getZoom()
    const newZoom = zoom + (delta / 1000) * zoom
    canvas.zoomToPoint(
      { x: opt.e.offsetX, y: opt.e.offsetY },
      Math.min(10, Math.max(0.01, newZoom))
    )
    opt.e.preventDefault()
    opt.e.stopPropagation()
  })

  // panning
  let isDragging = false
  let multiTouch = false
  let lastPosX = 0
  let lastPosY = 0
  let deltaX = 0
  let deltaY = 0
  const last10posX: number[] = []
  const last10posY: number[] = []
  canvas.on("mouse:down", opt => {
    window.lastMapInteraction = new Date()
    const { pointer } = opt
    if (!pointer) return
    isDragging = true
    lastPosX = pointer.x
    lastPosY = pointer.y
    last10posX.length = 0
    last10posY.length = 0
    deltaX = 0
    deltaY = 0
  })
  canvas.on("mouse:move", opt => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const e = opt.e as TouchEvent | MouseEvent
    // detect multi touch
    if ("touches" in e && e.touches && e.touches.length > 1) {
      multiTouch = true
    }
    if (multiTouch) return

    const { pointer } = opt
    // if an object is selected, don't pan
    if (canvas.getActiveObject()) return
    if (!isDragging || !pointer) return
    const vpt = canvas.viewportTransform

    if (vpt) {
      vpt[4] += pointer.x - lastPosX
      vpt[5] += pointer.y - lastPosY
    }
    canvas.requestRenderAll()
    lastPosX = pointer.x
    lastPosY = pointer.y
    last10posX.push(lastPosX)
    last10posY.push(lastPosY)
    if (last10posX.length > 10) {
      last10posX.shift()
      last10posY.shift()
    }

    // set coords on all objects
    canvas.getObjects().forEach(obj => {
      obj.setCoords()
    })

    window.lastMapInteraction = new Date()
  })
  canvas.on("mouse:up", () => {
    window.lastMapInteraction = new Date()
    isDragging = false
    const lastX = last10posX[last10posX.length - 1]
    const lastY = last10posY[last10posY.length - 1]
    const firstX = last10posX[0]
    const firstY = last10posY[0]
    deltaX = (lastX - firstX) / 10
    deltaY = (lastY - firstY) / 10
    multiTouch = false
    canvas.requestRenderAll()
  })
  // inertia
  canvas.on("before:render", () => {
    if (isDragging) return
    if (last10posX.length < 2) return
    const vpt = canvas.viewportTransform
    if (vpt) {
      vpt[4] += deltaX
      vpt[5] += deltaY
      deltaX *= 0.95
      deltaY *= 0.95

      if (deltaX > 0.1 || deltaY > 0.1) {
        // set coords on all objects
        canvas.getObjects().forEach(obj => {
          obj.setCoords()
        })
        canvas.requestRenderAll()
      }
    }
  })
}
