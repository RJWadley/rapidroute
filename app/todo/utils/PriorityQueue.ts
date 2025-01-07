export default class PriorityQueue<T> {
	private nodes: {
		element: T
		priority: number
	}[]

	public constructor() {
		this.nodes = []
	}

	public enqueue(element: T, priority: number): void {
		// insert the element in the correct position
		const newNode = { element, priority }
		const index = this.nodes.findIndex((node) => priority < node.priority)
		if (index === -1) {
			this.nodes.push(newNode)
		} else {
			this.nodes.splice(index, 0, newNode)
		}

		// remove duplicates, keeping the one with the lowest priority
		const duplicates = this.nodes.filter(
			(node) => node.element === element && node.priority > priority,
		)

		for (const duplicate of duplicates) {
			const i = this.nodes.indexOf(duplicate)
			this.nodes.splice(i, 1)
		}
	}

	public dequeue(): T | undefined {
		return this.nodes.shift()?.element
	}

	public isEmpty(): boolean {
		return this.nodes.length === 0
	}

	public clear(): void {
		this.nodes = []
	}
}
