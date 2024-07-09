type Primitive = string | number | boolean | undefined | null
type Zipped<T extends any[][]> = {[K in keyof T]: T[K][number]}

export function assert(condition: boolean, message: string = "Assertion failed"): asserts condition {
  if (!condition) throw new Error(message)
}

export function isFunction(x: unknown): x is Function {
  return typeof x === "function"
}

export function createId(): string {
  return crypto.randomUUID().replaceAll("-", "")
}

export function unwrap<T, A extends any[]>(value: T | ((...args: A) => T), ...args: A): T {
  return isFunction(value) ? value(...args) : value
}

export function round(number: number, precision = 0) {
  if (!precision) {
    return Math.round(number)
  }
  const pair1 = `${number}e`.split("e") as [string, string]
  const value = Math.round(+`${pair1[0]}e${+pair1[1] + precision}`)
  const pair2 = `${value}e`.split("e") as [string, string]
  return +`${pair2[0]}e${+pair2[1] - precision}`
}

export function clamp(num: number, lower: number, upper: number): number {
  return isNaN(num) || isNaN(lower) || isNaN(upper)
    ? NaN
    : num > upper ? upper : num < lower ? lower : num
}

export function cumsum(arr: number[]): number[] {
  let sum = 0
  return arr.map(num => sum += num)
}

export const getKeys: <K extends keyof any>(obj: Partial<Record<K, unknown>>) => K[] = Object.keys

export const getEntries: <K extends keyof any, V>(obj: Partial<Record<K, V>>) => [K, V][] = Object.entries

export function flatObjects<T extends Record<any, any>>(objects: T[]): T {
  return Object.assign({}, ...objects)
}

export function isEither<T extends Primitive, U extends T>(value: T, compare: U[]): value is U {
  return compare.includes(<U>value)
}

export function filterNull<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined
}

export function dropNulls<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(filterNull)
}

export function dropObjectNulls<T extends string, U>(obj: Record<T, U | null>): Record<T, U> {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null)) as Record<T, U>
}

export function zip<Arrays extends any[][]>(...arrays: Arrays): Zipped<Arrays>[] {
  const length = Math.min(...arrays.map(arr => arr.length))
  const indices = Array.from({length: arrays.length}, (_, i) => i)
  return Array.from({length}, (_, i) => {
    return indices.map(j => arrays[j]![i]!) as Zipped<Arrays>
  })
}

export function unique<T extends any[]>(arr: T): T {
  return [...new Set(arr)] as T
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

export function toggleValue<T>(values: T[], toggleValue: T): T[] {
  const filtered = values.filter(val => val !== toggleValue)
  return filtered.length === values.length ? [...values, toggleValue] : filtered
}

export function groupFromEntries<K extends string, T>(entries: Iterable<readonly [K, T]>): Record<K, T[]> {
  const map = {} as Record<K, T[]>
  for (const [key, value] of entries) {
    map[key] = map[key] ?? []
    map[key].push(value)
  }
  return map
}

export function trimString(str: string): string {
  return str.trim().replace(/ +/g, " ")
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

export function readTextFiles(mimeTypes: string[], multiple = false, encoding = "UTF-8"): Promise<string[]> {
  return new Promise(resolve => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = mimeTypes.join(",")
    input.multiple = multiple
    input.click()
    input.onchange = () => {
      const files = Array.from(input.files!)
      const fileContents = files.map(file => {
        return new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.readAsText(file, encoding)
          reader.onload = evt => {
            resolve(evt.target!.result as string)
          }
        })
      })
      Promise.all(fileContents).then(resolve)
    }
  })
}
