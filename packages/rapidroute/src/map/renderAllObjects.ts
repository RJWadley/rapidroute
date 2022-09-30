import { fabric } from "fabric"

export default function renderAllObjects(canvas: fabric.Canvas) {
  // add a rectangle
  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: "green",
    width: 50,
    height: 50,
    selectable: false,
  })

  canvas.add(rect)

  // on double click or tap, add a new rectangle
  rect.on("mousedblclick", () => {
    rect.selectable = true

    // select the object
    canvas.setActiveObject(rect)
    canvas.renderAll()
  })
  rect.on("mousedown", event => {
    // if touch event, set selectable to true
    if (event.e.type === "touchstart") {
      rect.selectable = true
    }
  })
  rect.on("selected", () => {
    // transparent blue background
    rect.set("fill", "rgba(0, 0, 255, 0.5)")
  })
  rect.on("deselected", () => {
    rect.selectable = false
    rect.set("fill", "green")
    canvas.renderAll()
  })
}
