import {createEffect} from "solid-js"

export function isElementVisible(target: HTMLElement): Promise<boolean> {
  return new Promise(resolve => {
    const observer = new IntersectionObserver(entries => {
      observer.disconnect()
      resolve(entries[0]!.isIntersecting)
    })
    observer.observe(target)
  })
}

export function useScrollTo(
  ref: () => HTMLElement | undefined,
  active: () => boolean,
  {smooth = true}: {smooth?: boolean} = {},
): void {
  createEffect(async () => {
    const elem = ref()
    if (active() && elem && !await isElementVisible(elem)) {
      elem.scrollIntoView({block: "center", behavior: smooth ? "smooth" : "instant"})
    }
  })
}
