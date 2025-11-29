type Primitive = string | number | boolean | undefined | null
type Zipped<T extends any[][]> = {[K in keyof T]: T[K][number]}
type ElementType<A extends readonly unknown[]> = A[number]

type CxArgument = Primitive | Record<string, any> | CxArgumentArray
type CxArgumentArray = CxArgument[]

export function noop(): void {}

export function identity<T>(x: T): T {
  return x
}

export function assert(condition: any, message = "Assertion failed"): asserts condition {
  if (!condition) throw new Error(message)
}

export function asserted<T>(x: T | null | undefined): T {
  assert(x != null)
  return x
}

export function triable<T>(cb: () => T): [T, undefined] | [undefined, object] {
  try {
    return [cb(), undefined]
  } catch (err) {
    return [undefined, err!]
  }
}

export function isFunction(x: unknown): x is Function {
  return typeof x === "function"
}

export function isGeneratorFunction<T>(x: unknown): x is () => Generator<T> {
  return typeof x === "function" && x.constructor.name === "GeneratorFunction"
}

export function createId(): string {
  if (window.isSecureContext) {
    return crypto.randomUUID().replaceAll("-", "")
  }
  const values = [...crypto.getRandomValues(new Uint8Array(32))]
  return values.map(val => (val & 15).toString(16)).join("")
}

export function unwrap<T, A extends any[]>(value: T | ((...args: A) => T), ...args: A): T {
  return isFunction(value) ? value(...args) : value
}

export const getKeys: <K extends keyof any>(obj: Partial<Record<K, unknown>>) => K[] = Object.keys

export const getEntries: <K extends keyof any, V>(obj: Partial<Record<K, V>>) => [K, V][] = Object.entries

export function flatObjects<T extends Record<any, any>>(objects: T[]): T {
  return Object.assign({}, ...objects)
}

export function isEither<T extends Primitive, U extends T>(value: T, compare: U[]): value is U {
  return compare.includes(<U>value)
}

export function notNull<T>(x: T | null | undefined): x is T {
  return x != null
}

export function dropNulls<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(notNull)
}

export function dropObjectNulls<T extends string, U>(obj: Record<T, U | null | undefined>): Record<T, U> {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null)) as Record<T, U>
}

export function range(start: number, end: number): number[] {
  return Array.from({length: end - start}, (_, i) => start + i)
}

export function zip<Arrays extends any[][]>(...arrays: Arrays): Zipped<Arrays>[] {
  const length = Math.min(...arrays.map(array => array.length))
  const indices = Array.from({length: arrays.length}, (_, j) => j)
  return Array.from({length}, (_, i) => {
    return indices.map(j => arrays[j]![i]!) as Zipped<Arrays>
  })
}

const sortFn = (a: any, b: any) => Number(a > b) - Number(a < b)

export function sort<T extends any[]>(array: T, cb: (x: ElementType<T>) => any = identity, reverse = false): T {
  const direction = reverse ? -1 : 1
  return array.toSorted((a, b) => sortFn(cb(a), cb(b)) * direction) as T
}

export function unique<T extends any[]>(array: T): T {
  return [...new Set(array)] as T
}

export function sortUnique<T extends any[]>(array: T): T {
  return sort(unique(array))
}

function indexFromNegative(array: any[], index: number) {
  return index < 0 ? array.length + index : index
}

export function moveValue<T>(array: T[], from: number, to: number): T[] {
  const copy = array.slice()
  to = indexFromNegative(array, to)
  from = indexFromNegative(array, from)
  copy.splice(to, 0, copy.splice(from, 1)[0]!)
  return copy
}

export function insertAt<T>(array: T[], index: number, value: T): T[] {
  return array.toSpliced(indexFromNegative(array, index), 0, value)
}

export function setAt<T>(array: T[], index: number, value: T): T[] {
  const copy = array.slice()
  copy[indexFromNegative(array, index)] = value
  return copy
}

export function removeAt<T>(array: T[], index: number): T[] {
  return array.toSpliced(indexFromNegative(array, index), 1)
}

export function removeValue<T>(array: T[], value: T): T[] {
  return array.filter(x => x !== value)
}

export function toggleValue<T>(array: T[], value: T): T[] {
  const filtered = array.filter(val => val !== value)
  return filtered.length === array.length ? [...array, value] : filtered
}

export function replace<T>(array: T[], search: T, value: T) {
  return array.map(x => x === search ? value : x)
}

export function partition<T>(array: [boolean, T][]): [T[], T[]] {
  const trueValues: T[] = []
  const falseValues: T[] = []
  for (const [predicate, value] of array) {
    const arr = predicate ? trueValues : falseValues
    arr.push(value)
  }
  return [trueValues, falseValues]
}

export function mapObject<K extends string, T, U>(obj: Record<K, T>, fn: (value: T, key: K) => U): Record<K, U> {
  const result = {} as Record<K, U>
  for (const key of getKeys(obj))
    result[key] = fn(obj[key], key)
  return result
}

export function mapMap<K, T, U>(obj: Map<K, T>, fn: (value: T, key: K) => U): Map<K, U> {
  const result = new Map<K, U>()
  for (const [key, value] of obj.entries())
    result.set(key, fn(value, key))
  return result
}

export function groupFromEntries<K extends string, T>(entries: Iterable<readonly [K, T]> | (() => Generator<[K, T]>)): Record<K, T[]> {
  const map = {} as Record<K, T[]>
  for (const [key, value] of isGeneratorFunction(entries) ? entries() : entries) {
    map[key] = map[key] ?? []
    map[key].push(value)
  }
  return map
}

export function trimString(str: string): string {
  return str.trim().replace(/ +/g, " ")
}

export function cx(...args: CxArgumentArray): string {
  return args.map((arg): string => {
    if (typeof arg === "string") {
      return arg
    } else if (typeof arg !== "object" || arg === null) {
      return ""
    } else if (Array.isArray(arg)) {
      return cx(...arg)
    } else {
      return Object.keys(arg).filter(key => arg[key] && key).join(" ")
    }
  }).filter(x => x).join(" ")
}

export function getSearch(searchQuery: string): (candidateText: string) => boolean {
  const evenQuotes = (searchQuery.match(/"/g) || []).length % 2 === 0
  const searchQueryLower = searchQuery.toLowerCase() + (evenQuotes ? "" : "\"")
  const multiWordTerms: string[] = searchQueryLower.match(/"((?:\\.|[^"\\])*)"/g) || []
  const wordTerms = multiWordTerms
    .reduce((prev, multiWordTerm) => prev.replace(multiWordTerm, ""), searchQueryLower)
    .split(" ")
    .filter(str => str)
  const multiWordTermsTrimmed = multiWordTerms.map(match => match.replaceAll("\"", ""))
  const queryTerms = [...wordTerms, ...multiWordTermsTrimmed]
  if (!searchQuery.length) {
    return () => true
  }
  return candidateText => {
    return queryTerms.every(term => candidateText.includes(term))
  }
}

export function sleep(duration: number): Promise<void> {
  return new Promise(resolve => setTimeout(() => resolve(), duration))
}

export function downloadPrompt(filename: string, data: Blob | string): void {
  const elem = document.createElement("a")
  elem.style.display = "none"
  elem.download = filename
  elem.href = typeof data === "string" ? `data:text/plain;charset=utf-8,${encodeURIComponent(data)}` : URL.createObjectURL(data)
  document.body.appendChild(elem)
  elem.click()
  document.body.removeChild(elem)
  URL.revokeObjectURL(elem.href)
}

export function readFiles(mimeTypes: string[] = ["*"], multiple = false): Promise<File[]> {
  return new Promise(resolve => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = mimeTypes.join(",")
    input.multiple = multiple
    input.click()
    input.oncancel = () => resolve([])
    input.onchange = () => resolve(Array.from(input.files!))
  })
}

export async function readTextFiles(mimeTypes: string[], multiple = false, encoding = "UTF-8"): Promise<string[]> {
  const files = await readFiles(mimeTypes, multiple)
  const fileContents = files.map(file => {
    return new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.readAsText(file, encoding)
      reader.onload = evt => resolve(evt.target!.result as string)
    })
  })
  return Promise.all(fileContents)
}

export function readJSONFiles(multiple = false): Promise<any[]> {
  return readTextFiles(["application/json"], multiple).then(jsons => jsons.map(x => JSON.parse(x)))
}

export function timeout(fn: (...x: any) => void, delay: number): () => void {
  if (delay <= 0) {
    fn()
    return () => {}
  }
  const timeoutId = setTimeout(fn, delay)
  return () => clearTimeout(timeoutId)
}
