import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	server: {
		port: 3000,
	},
	optimizeDeps: {
		include: ["pixi-viewport"],
	},
	ssr: {
		noExternal: ["pixi-viewport"],
	},
	plugins: [
		// Enables Vite to resolve imports using path aliases.
		tsconfigPaths(),
		tanstackStart({
			tsr: {
				routesDirectory: "app/routes",
				generatedRouteTree: "app/routeTree.gen.ts",
			},
		}),
	],
})
