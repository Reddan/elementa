type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  // | BigInt64Array
  // | BigUint64Array

type NumberArray = number[] | TypedArray

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

export function sum(arr: NumberArray): number {
  return (arr as number[]).reduce((a, b) => a + b, 0)
}

export function mean(arr: NumberArray): number {
  return sum(arr) / arr.length
}

export function max(arr: NumberArray): number {
  if (!arr.length) {
    return 0
  }
  let max = -Infinity
  for (const num of arr) {
    if (num > max) {
      max = num
    }
  }
  return max
}

export function min(arr: NumberArray): number {
  if (!arr.length) {
    return 0
  }
  let min = Infinity
  for (const num of arr) {
    if (num < min) {
      min = num
    }
  }
  return min
}

export function cumsum<T extends NumberArray>(arr: T): T {
  let sum = 0
  return arr.map(num => sum += num) as T
}
