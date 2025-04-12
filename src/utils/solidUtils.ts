import {createRenderEffect, JSX, mapArray} from "solid-js"
import {assert, isFunction} from "./utils"

// TODO: ZipFor component (keyed by first array)

export function forEachArray<T>(arr: () => T[], fn: (x: T) => void) {
  createRenderEffect(mapArray(arr, fn))
}

export function when<T, U>(value: () => T | undefined, cb: (x: T) => U) {
  const getArray = () => {
    const val = value()
    return val ? [val] : []
  }
  const array = mapArray(getArray, cb)
  return () => array()[0]
}

export function getJSXRect(children: JSX.Element): {width: number, height: number} {
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.visibility = "hidden"
  container.appendChild(children as HTMLElement)
  document.body.appendChild(container)
  const {width, height} = container.getBoundingClientRect()
  document.body.removeChild(container)
  return {width, height}
}

export function mergeRefs<T extends Element>(...refs: (T | ((elem: T) => void) | undefined)[]) {
  return (elem: T) => {
    for (const ref of refs) {
      assert(isFunction(ref) || !ref)
      ref?.(elem)
    }
  }
}
