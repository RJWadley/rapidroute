import { styled } from "next-yak"

export default async function HomePage() {
	await new Promise((resolve) => setTimeout(resolve, 1000))

	return <Test>Hello World!</Test>
}

const Test = styled.div`color:red;`
