import {createEffect, createSignal, on, Signal} from "solid-js"
import {createStore, SetStoreFunction, Store} from "solid-js/store"

const localSignalMap: Record<string, Signal<any>> = {}

function createLocalSignalInner<T>(key: string, initState: T, debounce = 0): Signal<T> {
  const [state, setState] = createSignal(Object.hasOwn(localStorage, key) ? JSON.parse(localStorage[key]) : initState)
  let writeTimeout = 0

  const write = () => {
    localStorage[key] = JSON.stringify(state())
  }

  createEffect(on(state, () => {
    if (debounce) {
      clearTimeout(writeTimeout)
      writeTimeout = setTimeout(write, debounce)
    } else {
      write()
    }
  }))

  return [state, setState]
}

export function createLocalSignal<T>(key: string, initState: T, debounce = 0): Signal<T> {
  // TODO: allow signal keys
  return localSignalMap[key] ??= createLocalSignalInner(key, initState, debounce)
}

export function createLocalStore<T extends object>(key: string, initState: T): [Store<T>, SetStoreFunction<T>] {
  const [state, setState] = createStore<T>(Object.hasOwn(localStorage, key) ? JSON.parse(localStorage[key]) : initState)

  createEffect(() => {
    if (state === initState) {
      delete localStorage[key]
    } else {
      localStorage[key] = JSON.stringify(state)
    }
  })

  return [state, setState]
}
