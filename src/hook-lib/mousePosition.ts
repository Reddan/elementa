// https://primitives.solidjs.community/package/mouse#createMousePosition

import {createMemo, createSignal} from "solid-js"

const [relativeMousePos, setRelativeMousePos] = createSignal({x: 0, y: 0})
const [scrollPos, setScrollPos] = createSignal({left: 0, top: 0})

const onMouseEvent = (evt: MouseEvent) => {
  setRelativeMousePos({x: evt.clientX, y: evt.clientY})
}

const onScroll = () => {
  setScrollPos({left: window.scrollX, top: window.scrollY})
}

window.addEventListener("mousemove", onMouseEvent)
window.addEventListener("mouseover", onMouseEvent)
window.addEventListener("scroll", onScroll)
window.addEventListener("resize", onScroll)

export const mousePosition = createMemo<{x: number, y: number}>(prev => {
  const {x, y} = relativeMousePos()
  const {left, top} = scrollPos()
  const next = {x: x + left, y: y + top}
  return next.x === prev.x && next.y === prev.y ? prev : next
}, {x: 0, y: 0})
