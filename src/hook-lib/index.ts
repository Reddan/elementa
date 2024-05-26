import {createEffect, createMemo, createSignal, on, onCleanup} from "solid-js"
import equals from "fast-deep-equal"
import {round} from "lodash"
import {useEventListener} from "./useEventListener"

export * from "./createLocalSignal"
export * from "./useCursor"
export * from "./useEventListener"
export * from "./useKeyPress"
export * from "./useScrollTo"
export * from "./mousePosition"
export * from "./mouseHeld"

export function usePrevious<T>(value: () => T): () => T {
  const stack = createMemo<[T, T]>(prev => {
    const v = value()
    return v === prev[0] ? prev : [v, prev[0]]
  }, [value(), value()])
  return () => stack()[1]
}

export function useMostRecent<T>(value: () => T): () => T {
  return createMemo<T>(prev => {
    return value() !== undefined && value() !== null ? value() : prev
  }, value())
}

export function useScrollPosition(elem: () => HTMLElement | SVGElement | undefined) {
  const getPosition = () => {
    const {scrollLeft, scrollTop} = (elem() ?? document.createElement("div"))
    return {x: scrollLeft, y: scrollTop}
  }

  const [position, setPosition] = createSignal(getPosition(), {equals})
  const updatePosition = () => setPosition(getPosition())

  createEffect(on(elem, updatePosition))
  useEventListener(elem, "scroll", updatePosition, true)

  return position
}

export function useElementPosition(elem: () => HTMLElement | SVGElement | undefined) {
  const getPosition = () => {
    const {left, top} = (elem() ?? document.createElement("div")).getBoundingClientRect()
    return {x: left + window.scrollX, y: top + window.scrollY}
  }

  const [position, setPosition] = createSignal(getPosition(), {equals})
  const updatePosition = () => setPosition(getPosition())

  createEffect(on(elem, updatePosition))
  useEventListener(window, "wheel", updatePosition, true)
  useEventListener(window, "scroll", updatePosition, true)
  useEventListener(window, "resize", updatePosition, true)

  return position
}

export function useElementSize(elem: () => HTMLElement | SVGElement | undefined) {
  const getSize = () => {
    const {width, height} = (elem() ?? document.createElement("div")).getBoundingClientRect()
    return {width: round(width, 1), height: round(height, 1)}
  }

  const [size, setSize] = createSignal(getSize(), {equals})

  createEffect(on(elem, elem => {
    setSize(getSize())
    if (!elem) return
    const ro = new ResizeObserver(() => setSize(getSize()))
    ro.observe(elem)
    onCleanup(() => ro.disconnect())
  }))

  return size
}
