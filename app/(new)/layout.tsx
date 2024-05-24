import { Inter } from "next/font/google"
import "./style/reset.css"
import "./style/global.css"

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
			<body className={inter.className}>{children}</body>
		</html>
	)
}
