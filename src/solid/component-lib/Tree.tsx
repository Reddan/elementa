import {createMemo, createRenderEffect, createSignal, For, JSX, on, Show} from "solid-js"
import {groupFromEntries} from "~/utils"

type FolderProps<T> = {
  items: () => T[]
  depth: () => number
  selected: () => boolean
  visible: () => boolean
  setVisible: (visible: boolean) => void
  folder: () => string
  folderParts: () => string[]
}

type ItemProps<T> = {
  item: T
  depth: () => number
  selected: () => boolean
}

export function Tree<T>(
  props: {
    items: T[]
    partsBy: (item: T) => string[]
    folderParts?: string[]
    folderExpanded: (item: T) => boolean
    visible?: boolean
    expandTrigger?: () => void
    collapseTrigger?: () => void
    renderFolder: (props: FolderProps<T>) => JSX.Element
    renderItem: (props: ItemProps<T>) => JSX.Element
  },
) {
  const selected = createMemo(() => props.items.some(props.folderExpanded))
  const [visibleState, setVisible] = createSignal(selected())
  const folderParts = createMemo(() => props.folderParts ?? [])
  const folder = () => folderParts().at(-1)!
  const depth = () => folderParts().length
  const visible = createMemo(() => (!depth() || visibleState()) && (props.visible ?? true))

  const itemsByFolder = createMemo(() => {
    return groupFromEntries(props.items.map(item => {
      const parts = props.partsBy(item)
      const folder = parts.length > depth() + 1 ? parts[depth()]! : ""
      return [folder, item]
    }))
  })

  const folders = () => Object.keys(itemsByFolder()).filter(x => x).sort()
  const items = () => itemsByFolder()[""] ?? []

  createRenderEffect(() => selected() && setVisible(true))

  if (props.expandTrigger)
    createRenderEffect(on(props.expandTrigger, () => setVisible(true), {defer: true}))
  if (props.collapseTrigger)
    createRenderEffect(on(props.collapseTrigger, () => setVisible(selected()), {defer: true}))

  return (
    <>
      <Show when={depth() > 0 && props.visible}>
        {props.renderFolder({items: () => props.items, depth, selected, visible, setVisible, folder, folderParts})}
      </Show>
      <For each={folders()}>
        {folder => (
          <Tree
            items={itemsByFolder()[folder]!}
            partsBy={props.partsBy}
            folderParts={[...folderParts(), folder]}
            folderExpanded={props.folderExpanded}
            visible={visible()}
            expandTrigger={props.expandTrigger}
            collapseTrigger={props.collapseTrigger}
            renderFolder={props.renderFolder}
            renderItem={props.renderItem}
          />
        )}
      </For>
      <For each={visible() && items()}>
        {item => props.renderItem({item, depth, selected: () => selected() && props.folderExpanded(item)})}
      </For>
    </>
  )
}
