import { useQuery } from "@tanstack/react-query"
import PriorityQueue from "app/utils/PriorityQueue"
import { useLocalIsometric } from "app/utils/locals"
import { wrap } from "comlink"
import { type Container, Rectangle, type Sprite, type Text } from "pixi.js"
import {
	type RefObject,
	createContext,
	use,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { useViewportMoved } from "../Viewport"
import type { CullInput, WorkerOut } from "./getAllCullDistances"

const { getAllCullDistances } =
	typeof Worker === "undefined"
		? {}
		: wrap<WorkerOut>(
				new Worker(new URL("./getAllCullDistances", import.meta.url)),
			)

type ObjectType = Text | Sprite | Container

type OverlappingProperties = {
	getBounds: () => Rectangle | null
	priority: number
	/**
	 * at what zoom level should we always hide this item?
	 */
	minZoom?: number
	debugName: string
}

/**
 * Items with a higher priority (index) will be preferred.
 */
const priorities = [
	// cities
	"Unranked",
	"Community",
	"Councillor",
	"Mayor",
	"Senator",
	"Governor",
	"Premier",

	// spawn
	"spawn",

	// players
	"players",

	// hover
	"hover",
] as const
export type PriorityType = (typeof priorities)[number]

/**
 * get the bounding rectangle of the text at zoom level 1
 * @param item the item to get the bounds of
 * @returns rectangle of the bounds
 */
const getWorldBounds = (item: ObjectType): Rectangle => {
	const x = item.localTransform?.tx ?? 0
	const y = item.localTransform?.ty ?? 0
	const localBounds = item.getLocalBounds?.() ?? new Rectangle(0, 0, 0, 0)
	const transformedBounds = new Rectangle(
		x + localBounds.x,
		y + localBounds.y,
		localBounds.width,
		localBounds.height,
	)
	return transformedBounds
}

const OverlappingContext = createContext<{
	addItem: (id: string, item: OverlappingProperties) => void
	removeItem: (id: string) => void
	results: Record<string, number>
}>({
	addItem: () => {},
	removeItem: () => {},
	results: {},
})

export function OverlappingProvider({
	children,
}: { children: React.ReactNode }) {
	const [objectQueue] = useState(
		() =>
			new PriorityQueue<
				Omit<CullInput, "bounds"> & { getBounds: () => Rectangle | null }
			>(),
	)
	const [signal, setSignal] = useState(0)
	const triggerUpdate = () => setSignal((p) => p + 1)
	const [isometric] = useLocalIsometric()

	const { data } = useQuery({
		queryKey: ["cull-distances", signal, isometric],
		queryFn: async () => {
			if (objectQueue.length() === 0) return {}
			if (!getAllCullDistances) return {}

			const before = performance.now()
			const items = objectQueue.toArray().map((x) => ({
				...x,
				bounds: x.getBounds(),

				// these cannot be serialized
				getBounds: undefined,
			}))

			const distances = await getAllCullDistances(items)
			const after = performance.now()
			console.log(`getAllCullDistances took ${after - before}ms`)

			return Object.fromEntries(
				distances.map(({ target, zoom }) => [target.id, zoom]),
			)
		},

		refetchInterval: 2000,
		placeholderData: (previous) => previous,
	})

	return (
		<OverlappingContext.Provider
			value={{
				addItem: (id, { getBounds, priority, minZoom, debugName }) => {
					objectQueue.enqueue(
						{
							id,
							getBounds,
							priority,
							minZoom,
							debugName,
						},
						0,
					)
					triggerUpdate()
				},
				removeItem: (id) => {
					objectQueue.filter((x) => x.id !== id)
					triggerUpdate()
				},
				results: data ?? {},
			}}
		>
			{children}
		</OverlappingContext.Provider>
	)
}

export function useHideOverlapping({
	item,
	priority,
	minZoom,
	skipCheck = false,
	debugName,
}: {
	item: RefObject<ObjectType | null>
	priority: PriorityType
	minZoom?: number
	skipCheck?: boolean
	debugName: string
}) {
	const [visible, setVisible] = useState(false)
	const id = useMemo(() => crypto.randomUUID(), [])
	const { results, addItem, removeItem } = use(OverlappingContext)
	const boundsCache = useRef<Rectangle | null>(null)

	useEffect(() => {
		if (!item.current) return
		if (skipCheck) return

		addItem(id, {
			getBounds: () => {
				if (boundsCache.current) return boundsCache.current

				const bounds = item.current ? getWorldBounds(item.current) : null
				boundsCache.current = bounds
				return bounds
			},
			priority: priorities.indexOf(priority),
			minZoom,
			debugName,
		})

		return () => removeItem(id)
	}, [id, addItem, item, minZoom, priority, removeItem, skipCheck, debugName])

	const zoomForThisItem = results[id]
	useViewportMoved((viewport) => {
		boundsCache.current = null
		if (zoomForThisItem) {
			setVisible(viewport?.scale.x > zoomForThisItem)
		}
	})

	return visible
}
