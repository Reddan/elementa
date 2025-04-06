// https://corvu.dev/docs/primitives/popover/
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetAction
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetElement

import {children, createEffect, createRenderEffect, createSignal, JSX, onCleanup, onMount, Show} from "solid-js"
import {Portal} from "solid-js/web"
import {keyframes, styled} from "solid-styled-components"
import {mouseHeld, mousePosition, useElementPosition, useElementSize, useEventListener, useKeyPress} from "~/hook-lib"
import {forEachArray, round, unwrap} from "~/utils"

export type Trigger = {
  elem: Element | undefined
  event: "hover" | "click" | "mousedown" | "contextmenu"
  setOpen: (open: boolean) => void
}

export type PopoverPlacement = "initial-mouse" | "mouse" | "bottom" | "left" | "right" | "top" | "bottom-left" | "bottom-right"

type ForwardProps = {class?: string, inheritWidth?: boolean}
type StyleProps = {placement: PopoverPlacement, evasive: boolean}
type Element = HTMLElement | SVGElement

const portalElem = document.getElementById("portal-root")!
const triggeredPopoverByEvent = new WeakMap<MouseEvent, {}>()

function getParentMountElem(elem?: HTMLElement | SVGElement): HTMLElement {
  if (!elem) {
    return portalElem
  } else if (elem.classList.contains("popover")) {
    return elem as HTMLElement
  } else {
    return getParentMountElem(elem.parentElement ?? undefined)
  }
}

const appear = (placement: PopoverPlacement) => keyframes`
  from {
    opacity: 0;
    translate:
      ${placement === "right" ? "-8" : placement === "left" ? "8" : "0"}px
      ${placement.includes("bottom") ? "-8" : placement === "top" || placement === "mouse" ? "8" : "0"}px;
  }
  to {
    opacity: 1;
    translate: 0px 0px;
  }
`

const preventClick = keyframes`from {pointer-events: none;}`

const PopoverContainer = styled.div<{"prop:cssprops": StyleProps}>(({["prop:cssprops"]: props}) => `
  position: absolute;
  z-index: 4;
  box-shadow: 0 1px 45px 0 rgba(137, 137, 137, 0.16);
  border-radius: 4px;
  font-size: 15px;
  padding: 10px;
  color: #000;
  background-color: #fff;
  backdrop-filter: blur(16px);
  animation: ${appear(props.placement)} 200ms, ${preventClick} 300ms;
  ${props.evasive ? "&" : "_"} {
    pointer-events: none;
    user-select: none;
  }
`)

export function Popover(
  props: ForwardProps & {
    placement: PopoverPlacement

    mount: HTMLElement
    anchor: Element
    content: JSX.Element

    evasive?: boolean
  },
) {
  const [popover, setPopover] = createSignal<HTMLDivElement>()
  const anchorPosition = useElementPosition(() => props.anchor)
  const anchorSize = useElementSize(() => props.anchor)
  const popoverSize = useElementSize(popover)
  const initialMouse = mousePosition()
  const targetedMouse = () => props.placement === "mouse" ? mousePosition() : initialMouse
  const width = () => props.inheritWidth ? `${anchorSize().width}px` : undefined
  const initialPlacement = props.placement

  const position = () => {
    const {x: mouseX, y: mouseY} = targetedMouse()
    const {x: anchorX, y: anchorY} = anchorPosition()
    const {width: anchorWidth, height: anchorHeight} = anchorSize()
    const {width: popoverWidth, height: popoverHeight} = popoverSize()

    if (props.placement === "initial-mouse" || props.placement === "mouse") {
      const defaultPosition = mouseX + 10
      const fitsOnScreen = defaultPosition + popoverWidth < document.body.clientWidth
      const left = fitsOnScreen ? defaultPosition : mouseX - 10 - popoverWidth
      const top = mouseY + 10
      return {left: round(left, 1) + "px", top: round(top, 1) + "px"}
    } else if (props.placement === "left") {
      const right = document.body.clientWidth - anchorX + 5
      const top = anchorY + anchorHeight / 2 - popoverHeight / 2
      return {right: round(right, 1) + "px", top: round(top, 1) + "px"}
    } else if (props.placement === "right") {
      const left = anchorX + anchorWidth + 5
      const top = anchorY + anchorHeight / 2 - popoverHeight / 2
      return {left: round(left, 1) + "px", top: round(top, 1) + "px"}
    } else if (props.placement === "top") {
      const left = Math.max(10, anchorX + anchorWidth / 2 - popoverWidth / 2)
      const top = anchorY - popoverHeight - 5
      return {left: round(left, 1) + "px", top: round(top, 1) + "px"}
    } else if (props.placement === "bottom") {
      const defaultPosition = anchorY + anchorHeight + 5
      const fitsOnScreen = defaultPosition + popoverHeight < document.body.clientHeight
      const left = Math.max(10, anchorX + anchorWidth / 2 - popoverWidth / 2)
      const top = fitsOnScreen ? defaultPosition : anchorY - popoverHeight - 5
      return {left: round(left, 1) + "px", top: round(top, 1) + "px"}
    } else if (props.placement === "bottom-left") {
      const left = anchorX + anchorWidth - popoverWidth
      const top = anchorY + anchorHeight + 5
      return {left: round(left, 1) + "px", top: round(top, 1) + "px"}
    } else if (props.placement === "bottom-right") {
      const left = anchorX
      const top = anchorY + anchorHeight + 5
      return {left: round(left, 1) + "px", top: round(top, 1) + "px"}
    }
  }

  onMount(() => {
    const parentMountElem = getParentMountElem(props.anchor)
    parentMountElem.appendChild(props.mount)
    onCleanup(() => parentMountElem.removeChild(props.mount))
  })

  return (
    <Portal mount={props.mount}>
      <PopoverContainer
        ref={setPopover}
        class={props.class}
        prop:cssprops={{placement: initialPlacement, evasive: !!props.evasive}}
        style={{...position(), width: width()}}
        children={props.content}
      />
    </Portal>
  )
}

export function StatefulPopover(
  props: ForwardProps & {
    when: boolean
    placement: PopoverPlacement

    triggers: Trigger[]
    anchor: Element
    content: JSX.Element
  },
) {
  const popoverRef = {}
  const content = children(() => props.when && props.content)
  const mount = document.createElement("div")

  createRenderEffect(() => {
    mount.className = ["popover", ...props.triggers.map(trigger => `popover-${trigger.event}`)].join(" ")
  })

  forEachArray(() => props.triggers, ({elem: trigger, event, setOpen}) => {
    if (event === "hover") {
      useEventListener(window, "mousemove", evt => {
        setOpen(!mouseHeld() && trigger!.contains(evt.target as Element))
      })
    } else {
      useEventListener(trigger!, event, evt => {
        if (event === "contextmenu") {
          evt.preventDefault()
        }
        if (!triggeredPopoverByEvent.has(evt)) {
          setOpen(!props.when)
          triggeredPopoverByEvent.set(evt, popoverRef)
        }
      })
      createEffect(() => {
        if (props.when) {
          useKeyPress("Escape", () => setOpen(false), {stopPropagation: true})
        }
      })
    }

    useEventListener(window, "mousedown", evt => {
      const close = triggeredPopoverByEvent.get(evt) !== popoverRef
        && !mount.contains(evt.target as Element)
        && (!mount.querySelector(".popover") || triggeredPopoverByEvent.has(evt))
      if (close) setOpen(false)
    })
  })

  return (
    <Show when={content()}>
      <Popover
        placement={props.placement}
        mount={mount}
        anchor={props.anchor}
        content={content()}
        evasive={!!props.triggers.length && props.triggers.every(trigger => trigger.event === "hover")}
        inheritWidth={props.inheritWidth}
        class={props.class}
      />
    </Show>
  )
}

export function SimplePopover(
  props: ForwardProps & {
    triggerType?: Trigger["event"]
    placement?: PopoverPlacement

    content: JSX.Element | ((props: {close: () => void}) => JSX.Element)
    children: JSX.Element | ((props: {close: () => void, open: () => boolean}) => JSX.Element)

    anchor?: Element
    disabled?: boolean
  },
): JSX.Element {
  const [openState, setOpen] = createSignal(false)
  const open = () => openState() && !props.disabled
  const close = () => setOpen(false)
  const childInner = children(() => unwrap(props.children, {close, open}))
  const child = () => childInner()?.valueOf() as Element
  const content = () => unwrap(props.content, {close})

  createRenderEffect(() => {
    if (!props.disabled) (
      <StatefulPopover
        when={open()}
        placement={props.placement ?? "mouse"}
        triggers={[{elem: child(), event: props.triggerType ?? "hover", setOpen}]}
        anchor={props.anchor ?? child()}
        content={content()}
        inheritWidth={props.inheritWidth}
        class={props.class}
      />
    )
  })

  return <>{child()}</>
}
