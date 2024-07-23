import { styled } from "@pigment-css/react"
import "./global.css"
import MinecraftMap from "./components/Map/MapServer"
import RouteOptions from "./components/RouteOptions"
import { SearchBox } from "./components/SearchBox"
import SelectedRoute from "./components/SelectedRoute"
import { compressedPlaces } from "./utils/compressedPlaces"

export default function Page() {
	return (
		<Application>
			<MinecraftMap />
			<Column>
				<SearchBox places={compressedPlaces} />
				<RouteOptions />
			</Column>
			<Column>
				<SelectedRoute />
			</Column>
		</Application>
	)
}

const Application = styled.div`
	width: 100dvw;
	height: 100dvh;
	overflow: clip;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	place-items: start stretch;
`

const Column = styled.div`
	position: relative;
	z-index: 2;
	height: 100dvh;
	overflow: auto;
	pointer-events: none;
	
	& > * {
		pointer-events: auto;
	}
`
