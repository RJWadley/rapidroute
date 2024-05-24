import { styled } from "next-yak"
import MinecraftMap from "./components/Map"
import SearchBox from "./components/SearchBox"
import { prisma } from "temp/data/client"

export default async function HomePage() {
	const initialPlaces = await prisma.place.findMany()

	return (
		<>
			<MinecraftMap />
			<Sidebar>
				hello world
				<SearchBox initialPlaces={initialPlaces} />
			</Sidebar>
		</>
	)
}

const Sidebar = styled.div`
	position: relative;
	z-index: 1;
	max-width: 400px;
	background: white;
`
