import { styled } from "@pigment-css/react"

import "./data.ts"

export default function Home() {
	return (
		<>
			<Heading>hello world</Heading>
			<Heading isError>hello world!</Heading>
		</>
	)
}

const Heading = styled("h1")<{ isError?: boolean }>({
	color: ({ isError }) => (isError ? "red" : "black"),
})
