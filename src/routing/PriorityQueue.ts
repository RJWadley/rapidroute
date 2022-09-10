export default class PriorityQueue<T> {
  nodes: {
    element: T;
    priority: number;
  }[];

  constructor() {
    this.nodes = [];
  }

  enqueue(element: T, priority: number): void {
    // insert the element in the correct position using binary search
    const newNode = { element, priority };
    const index = this.nodes.findIndex((node) => priority < node.priority);
    if (index === -1) {
      this.nodes.push(newNode);
    } else {
      this.nodes.splice(index, 0, newNode);
    }
  }

  dequeue(): T | undefined {
    return this.nodes.shift()?.element;
  }

  isEmpty(): boolean {
    return !this.nodes.length;
  }
}
