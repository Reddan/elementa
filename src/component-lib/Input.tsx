import {createEffect, createSignal, JSX, onCleanup, splitProps} from "solid-js"
import {styled} from "solid-styled-components"

const Container = styled.input`
  min-width: 20px;
  border: 2px solid transparent;
  padding: 10px;
  outline: none;
  display: block;
  border-radius: 4px;
  background-color: #f5f5f5;
  font-weight: 400;
  &[disabled] {
    color: #b5b5b5;
  }
  &::placeholder {
    color: #b3b3b3;
    opacity: 1;
  }
`

type Props = Omit<JSX.IntrinsicElements["input"], "value" | "onInput" | "ref"> & {
  value: string
  onInput?: (value: string) => void
  onInputRaw?: (evt: InputEvent) => void
  autoWidth?: boolean
  rewrite?: (value: string) => string
  debounce?: number
  ref?: (elem: HTMLInputElement) => void
}

export function Input(props: Props) {
  const [local, others] = splitProps(props, ["value", "onInput", "onInputRaw", "autoWidth", "rewrite", "debounce", "ref"])
  const [value, setValue] = createSignal(local.value)
  const [input, setInput] = createSignal<HTMLInputElement>(document.createElement("input"))
  let timeout: number | undefined

  createEffect(() => setValue(local.value))

  createEffect(() => {
    if (local.autoWidth) {
      value()
      input().style.width = "0"
      input().style.width = input().scrollWidth + 4 + "px"
    }
  })

  onCleanup(() => {
    if (timeout && value() !== local.value) {
      local.onInput?.(value())
    }
    clearTimeout(timeout)
  })

  return (
    <Container
      {...others}
      value={value()}
      ref={elem => {
        local.ref?.(elem)
        setInput(elem)
      }}
      onInput={evt => {
        if (local.onInputRaw) {
          return local.onInputRaw(evt)
        }
        const init = evt.target.value
        const value = local.rewrite?.(init) ?? init
        const pos = evt.target.selectionStart! - 1
        evt.target.value = value
        setValue(value)
        if (init !== value) {
          evt.target.setSelectionRange(pos, pos)
        }
        if (!local.debounce) {
          return local.onInput?.(value)
        }
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          local.onInput?.(value)
          timeout = undefined
        }, local.debounce)
      }}
    />
  )
}
