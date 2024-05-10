declare module "fuzzysort" {
  interface SortResult<T> {
    target: string
    score: number
    _indexes: number[]
    obj: T | null
  }

  interface SortOptions<T> {
    threshold?: number
    limit?: number
    key?: keyof T
    keys?: (keyof T)[]
    scoreFn?: (results: Array<SortResult<T>>) => number | null
    all?: boolean
  }

  interface HighlightedResult {
    target: string
    _indexes: number[]
    obj: any // Change 'any' to the appropriate type
  }

  interface FuzzySort {
    single(sort: string, target: string): SortResult<null> | null
    go<T>(
      sort: string,
      targets: T[],
      options?: SortOptions<T>
    ): Array<SortResult<T>>
    highlight(
      result: SortResult<any>,
      hOpen?: string | ((substring: string, matchIndex: number) => string),
      hClose?: string
    ): string | string[] | null
    indexes(result: SortResult<any>): number[]
    prepare(target: string): SortResult<null>
    cleanup(): void
  }

  const fuzzysort: FuzzySort
  export = fuzzysort
}
