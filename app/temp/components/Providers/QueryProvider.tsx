"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryFn: ({ queryKey, signal }) => {
				const url = queryKey[0];
				if (typeof url === "string")
					return fetch(url, { signal }).then((response) => response.json());
			},
		},
	},
});

export default function QueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
