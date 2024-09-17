import { TextStyle } from "pixi.js"

export const regular = new TextStyle({
	fill: "white",
	stroke: {
		width: 3,
		color: "black",
		miterLimit: 4,
		cap: "round",
	},
	fontFamily: "Inter, Arial",
	fontSize: 16,
	align: "center",
})

export const regularHover = new TextStyle({
	fill: "#ffe499",
	stroke: "black",
	fontFamily: "Inter, Arial",
	fontSize: 16,
	align: "center",
})
