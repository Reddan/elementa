import {createEffect, onCleanup} from "solid-js"
import {unwrap} from "~/utils"
import {useEventListener} from "./useEventListener"

type KeyPressOptions = {
  eventName?: "keydown" | "keyup" | "keypress"
  stopPropagation?: boolean
  disableFor?: number
  ignoreInputs?: boolean
}

type Listener = {stopPropagation: boolean}

export const heldKeys = new Set<string>()
const listenersByKey: Record<string, Listener[]> = {}
const stopByEvent = new WeakSet<KeyboardEvent>()

window.addEventListener("keydown", evt => heldKeys.add(evt.key))
window.addEventListener("keyup", evt => heldKeys.delete(evt.key))
window.addEventListener("blur", () => {
  for (const key of heldKeys) {
    window.dispatchEvent(new KeyboardEvent("keyup", {key}))
  }
  heldKeys.clear()
})

export function useKeyPress(
  key: string | (() => string),
  callback: (evt: KeyboardEvent) => void,
  {eventName = "keydown", stopPropagation = false, disableFor = 0, ignoreInputs = true}: KeyPressOptions = {},
) {
  const self = {stopPropagation}
  let disabledUntil = 0

  createEffect(() => {
    const k = unwrap(key)
    listenersByKey[k] = listenersByKey[k] ?? []
    listenersByKey[k]!.push(self)
    onCleanup(() => {
      listenersByKey[k] = listenersByKey[k]!.filter(x => x !== self)
    })
  })

  useEventListener(window, eventName, evt => {
    const k = unwrap(key)
    const keys = k.split("+").map(x => x || "+")
    const modifiers = keys.slice(0, keys.length - 1)
    const actionKey = keys[keys.length - 1]
    const listeners = listenersByKey[k] ?? []
    const listenerIndex = listeners.indexOf(self)
    const inputFocus = ["INPUT", "TEXTAREA"].includes(document.activeElement?.nodeName!)
      || (document.activeElement as HTMLElement)?.contentEditable === "true"
    const triggered = evt.key === actionKey
      && modifiers.every(modifier => heldKeys.has(modifier))
      && Date.now() > disabledUntil
      && (ignoreInputs || !inputFocus)
      && listeners.slice(listenerIndex + 1).every(x => !x.stopPropagation)
      && !stopByEvent.has(evt)
    if (triggered) {
      if (stopPropagation) {
        stopByEvent.add(evt)
      }
      disabledUntil = Date.now() + disableFor
      callback(evt)
    }
  })
}
