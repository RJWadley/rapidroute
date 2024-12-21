import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TanstackProvider } from "./TanstackProvider"
import { MovementProvider } from "./components/MapMovement"

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
	return (
		<html lang="en">
			<body className={inter.className} style={{ fontWeight: 300 }}>
				<SpeedInsights />
				<TanstackProvider>
					<MovementProvider>{children}</MovementProvider>
				</TanstackProvider>
			</body>
		</html>
	)
}
