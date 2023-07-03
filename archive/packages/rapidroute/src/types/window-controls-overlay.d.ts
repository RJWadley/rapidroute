// extend navigator with types for window controls overlay api
interface Navigator {
  windowControlsOverlay?: {
    visible: boolean
    getTitlebarAreaRect: () => DOMRect
  }
}
