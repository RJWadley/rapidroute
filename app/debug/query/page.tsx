import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from "@tanstack/react-query"
import { Demo } from "./Demo"
import { getRandomColor } from "./sample-api"

export default async function MainPage() {
	const queryClient = new QueryClient()

	await queryClient.prefetchQuery({
		queryKey: ["color"],
		queryFn: getRandomColor,
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Demo />
		</HydrationBoundary>
	)
}
