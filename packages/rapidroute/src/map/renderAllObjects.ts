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
    console.log("double clicked")
    rect.selectable = true
    rect.set("fill", "blue")

    // select the object
    canvas.setActiveObject(rect)

    canvas.renderAll()
  })
  rect.on("deselected", () => {
    console.log("deselected")
    rect.selectable = false
    rect.set("fill", "green")
    canvas.renderAll()
  })
}
