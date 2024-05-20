import {createEffect, createSignal, Signal} from "solid-js"
import {createStore, SetStoreFunction, Store} from "solid-js/store"

const localSignalMap: Record<string, Signal<any>> = {}

export function createLocalSignalInner<T>(key: string, initState: T): Signal<T> {
  const [state, setState] = createSignal(Object.hasOwn(localStorage, key) ? JSON.parse(localStorage[key]) : initState)

  createEffect(() => {
    localStorage[key] = JSON.stringify(state())
  })

  return [state, setState]
}

export function createLocalSignal<T>(key: string, initState: T): Signal<T> {
  return localSignalMap[key] ?? (localSignalMap[key] = createLocalSignalInner(key, initState))
}

export function createLocalStore<T extends object>(key: string, initState: T): [Store<T>, SetStoreFunction<T>] {
  const [state, setState] = createStore<T>(Object.hasOwn(localStorage, key) ? JSON.parse(localStorage[key]) : initState)

  createEffect(() => {
    localStorage[key] = JSON.stringify(state)
  })

  return [state, setState]
}
