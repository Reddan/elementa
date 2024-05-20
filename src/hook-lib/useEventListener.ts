import {createEffect, onCleanup} from "solid-js"
import {unwrap} from "~/utils"

type Element = {
  addEventListener: any
  removeEventListener: any
}

type EventType<Elem extends Element> = {
  [K in keyof Elem]-?: K extends `on${infer E}` ? E : never
}[keyof Elem]

type Event<
  Elem extends Element,
  Type extends EventType<Elem>,
> = Elem extends Record<`on${Type}`, null | ((evt: infer Arg) => void)>
  ? Arg
  : never

export function radEventListener<Elem extends Element, Type extends EventType<Elem>>(
  element: Elem,
  type: Type,
  listener: (evt: Event<Elem, Type>) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  element.addEventListener(type, listener, options)
  return () => {
    element.removeEventListener(type, listener, options)
  }
}

export function useEventListener<Elem extends Element, Type extends EventType<Elem>>(
  element: Elem | (() => Elem | undefined),
  type: Type,
  listener: (evt: Event<Elem, Type>) => void,
  options?: boolean | AddEventListenerOptions,
) {
  createEffect(() => {
    const targetElement = unwrap(element)
    if (targetElement) {
      onCleanup(radEventListener(targetElement, type, listener, options))
    }
  })
}
