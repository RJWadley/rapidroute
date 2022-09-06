export default class PriorityQueue<T> {
  nodes: {
    element: T;
    priority: number;
  }[];

  constructor() {
    this.nodes = [];
  }

  enqueue(element: T, priority: number): void {
    this.nodes.push({ element, priority });
    this.sort();
  }

  dequeue(): T | undefined {
    return this.nodes.shift()?.element;
  }

  isEmpty(): boolean {
    return !this.nodes.length;
  }

  sort(): void {
    this.nodes.sort((a, b) => a.priority - b.priority);
  }
}
