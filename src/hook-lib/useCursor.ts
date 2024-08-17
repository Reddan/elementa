import {createEffect, createSignal, on, onCleanup} from "solid-js"
import {removeAt} from "~/utils"

type Cursor = {name: string}

const [stack, setStack] = createSignal<Cursor[]>([])

createEffect(() => {
  const cursors = stack()
  const cursor = cursors[0]?.name
  document.body.style.cursor = cursor ?? ""
})

export function useCursor(cursor: () => string | null | undefined | false): void {
  // cursor = createMemo(cursor)
  createEffect(on(cursor, name => {
    if (name) {
      const container: Cursor = {name}
      setStack([...stack(), container])
      onCleanup(() => setStack(removeAt(stack(), stack().indexOf(container))))
    }
  }))
}
