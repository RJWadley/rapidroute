import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TanstackProvider } from "./QueryClient"
import "@pigment-css/react/styles.css"
import { RoutingProvider } from "./components/RoutingContext"
import { findPath } from "./pathing"
import { getSearchParams } from "./utils/getSearchParams"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const params = getSearchParams()
	const initialRoute = findPath(params.get("from"), params.get("to"))
	console.log("rendered layout!")

	return (
		<html lang="en">
			<body className={inter.className}>
				<TanstackProvider>
					<RoutingProvider initialRoute={initialRoute}>
						{children}
					</RoutingProvider>
				</TanstackProvider>
			</body>
		</html>
	)
}
