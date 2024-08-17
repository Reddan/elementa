// https://primitives.solidjs.community/package/mouse#createMousePosition

import {createMemo, createSignal} from "solid-js"

const [relativeMousePosition, setRelativeMousePosition] = createSignal({x: 0, y: 0})
const [scrollPosition, setScrollPosition] = createSignal({x: 0, y: 0})

function onMouseEvent(evt: MouseEvent) {
  setRelativeMousePosition({x: evt.clientX, y: evt.clientY})
}

function onScroll() {
  setScrollPosition({x: window.scrollX, y: window.scrollY})
}

window.addEventListener("mousemove", onMouseEvent, true)
window.addEventListener("mouseover", onMouseEvent, true)
window.addEventListener("mousedown", onMouseEvent, true)
window.addEventListener("scroll", onScroll, true)
window.addEventListener("resize", onScroll, true)

export const mousePosition = createMemo<{x: number, y: number}>(curr => {
  const mouse = relativeMousePosition()
  const scroll = scrollPosition()
  const next = {x: mouse.x + scroll.x, y: mouse.y + scroll.y}
  return next.x === curr.x && next.y === curr.y ? curr : next
}, {x: 0, y: 0})
