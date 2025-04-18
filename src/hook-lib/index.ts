import {createMemo, createRenderEffect, createSignal, on, onCleanup} from "solid-js"
import equals from "fast-deep-equal"
import {round} from "~/utils"
import {useEventListener} from "./useEventListener"

export * from "./createLocalSignal"
export * from "./useCursor"
export * from "./useEventListener"
export * from "./useKeyPress"
export * from "./useScrollTo"
export * from "./mousePosition"
export * from "./mouseHeld"

type XY = {x: number, y: number}
type WH = {width: number, height: number}

export function usePrevious<T>(value: () => T): () => T {
  const stack = createMemo<[T, T]>(prev => {
    const v = value()
    return !prev
      ? [v, v]
      : v === prev[0] ? prev : [v, prev[0]]
  })
  return () => stack()[1]
}

export function useMostRecent<T>(value: () => T): () => T {
  return createMemo<T>(prev => {
    const v = value()
    return v !== undefined && v !== null ? v : prev
  }, value())
}

export function useScrollPosition(elem: () => HTMLElement | SVGElement | undefined): () => XY {
  const getPosition = () => {
    const {scrollLeft, scrollTop} = (elem() ?? document.createElement("div"))
    return {x: scrollLeft, y: scrollTop}
  }

  const [position, setPosition] = createSignal(getPosition(), {equals})
  const updatePosition = () => setPosition(getPosition())

  createRenderEffect(on(elem, updatePosition))
  useEventListener(elem, "scroll", updatePosition, true)

  return position
}

export function useElementPosition(elem: () => HTMLElement | SVGElement | undefined): () => XY {
  const getPosition = () => {
    const {left, top} = (elem() ?? document.createElement("div")).getBoundingClientRect()
    return {x: left + window.scrollX, y: top + window.scrollY}
  }

  const [position, setPosition] = createSignal(getPosition(), {equals})
  const updatePosition = () => setPosition(getPosition())

  createRenderEffect(on(elem, updatePosition))
  useEventListener(window, "wheel", updatePosition, true)
  useEventListener(window, "scroll", updatePosition, true)
  useEventListener(window, "resize", updatePosition, true)

  return position
}

export function useElementSize(elem: () => HTMLElement | SVGElement | undefined): () => WH {
  const getSize = () => {
    const {width, height} = (elem() ?? document.createElement("div")).getBoundingClientRect()
    return {width: round(width, 1), height: round(height, 1)}
  }

  const [size, setSize] = createSignal(getSize(), {equals})

  createRenderEffect(on(elem, elem => {
    setSize(getSize())
    if (!elem) return
    const ro = new ResizeObserver(() => setSize(getSize()))
    ro.observe(elem)
    onCleanup(() => ro.disconnect())
  }))

  return size
}

export function useOnScreen(elem: () => HTMLElement | SVGElement | undefined, rootMargin = "0px"): () => boolean {
  const [isIntersecting, setIntersecting] = createSignal(false)

  createRenderEffect(on(elem, elem => {
    setIntersecting(false)
    if (!elem) return
    const io = new IntersectionObserver(entries => setIntersecting(entries.at(-1)!.isIntersecting), {rootMargin})
    io.observe(elem)
    onCleanup(() => io.disconnect())
  }))

  return isIntersecting
}
