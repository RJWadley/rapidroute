import { hydrateRoot } from "react-dom/client"
import { StartClient } from "@tanstack/react-start/client"

const rootElement = document.getElementById("root")
if (rootElement) {
	hydrateRoot(rootElement, <StartClient />)
}
