import {
	createStartHandler,
	defaultStreamHandler,
} from "@tanstack/react-start/server"
import { createRouter } from "@tanstack/react-router"
import { routeTree } from "../src/routeTree.gen"

export default createStartHandler({
	createRouter: () => createRouter({ routeTree }),
})
