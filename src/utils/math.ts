import {peekIterable} from "./utils"

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type NumberArray = number[] | TypedArray

export function round(number: number, precision = 0) {
  if (!precision)
    return Math.round(number)
  const pair1 = `${number}e`.split("e") as [string, string]
  const value = Math.round(+`${pair1[0]}e${+pair1[1] + precision}`)
  const pair2 = `${value}e`.split("e") as [string, string]
  return +`${pair2[0]}e${+pair2[1] - precision}`
}

export function ensureNumber(value: number, fallback: number): number {
  return isFinite(value) ? value : fallback
}

export function clamp(num: number, lower: number, upper: number): number {
  if (isNaN(num) || isNaN(lower) || isNaN(upper))
    return NaN
  return num > upper ? upper : num < lower ? lower : num
}

export function sum(...arrays: Iterable<number>[]): number {
  let sum = 0
  for (const array of arrays)
    for (const number of array)
      sum += number
  return sum
}

export function mean(array: NumberArray): number {
  const len = array.length
  return len && sum(array) / len
}

export function min(array: Iterable<number>): number {
  return extent(array)[0]
}

export function max(array: Iterable<number>): number {
  return extent(array)[1]
}

export function extent(array: Iterable<number>): [number, number] {
  const [isEmpty, iterable] = peekIterable(array)
  if (isEmpty) return [0, 0]
  let min = Infinity
  let max = -Infinity
  for (const num of iterable) {
    if (num < min) min = num
    if (num > max) max = num
  }
  return [min, max]
}

export function cumsum<T extends NumberArray>(array: T): T {
  let sum = 0
  return array.map(num => sum += num) as T
}
