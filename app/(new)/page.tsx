import { styled } from "next-yak"
import MinecraftMap from "./components/Map"

export default async function HomePage() {
	return (
		<Test>
			hello world
			<MinecraftMap />
		</Test>
	)
}

const Test = styled.div`color:red;`
