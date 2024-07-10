import { Application, extend } from "@pixi/react"
import { Container, Graphics } from "pixi.js"
import { useRef, useState } from "react"
import PixiViewport from "./PixiViewport"
import Satellite from "./Satellite"
import { styled } from "@pigment-css/react"

extend({
	Container,
	Graphics,
})

export default function MapBase() {
	const [hasInit, setHasInit] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)

	return (
		<Wrapper ref={wrapperRef}>
			<Application
				antialias
				autoDensity
				onInit={() => setHasInit(true)}
				resizeTo={wrapperRef}
			>
				{hasInit && (
					<PixiViewport>
						<Satellite />
					</PixiViewport>
				)}
			</Application>
		</Wrapper>
	)
}

const Wrapper = styled.div`
	width: calc(100vw - 20px);
	height: calc(100vh - 20px);
	border: 1px solid red;
`
