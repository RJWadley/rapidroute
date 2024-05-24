import { Inter } from "next/font/google"
import "the-new-css-reset/css/reset.css"
import "./style/global.css"

import { styled } from "next-yak"

export const metadata = {
	title: "Next.js",
	description: "Generated by Next.js",
}

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
})

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Window>{children}</Window>
			</body>
		</html>
	)
}

const Window = styled.div`
	width: 100vw;
	height: 100dvh;
	border: 1px solid red;
`
