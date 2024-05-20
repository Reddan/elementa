const style = document.documentElement.style
const valueByVar: Record<string, string> = {}

export function createCssvars(prefix: string) {
  let count = 0
  return function(value: string) {
    const reference = `var(--${prefix}-${count})`
    setCssvar(reference, value)
    count++
    return reference
  }
}

export function getCssvar(reference: string) {
  return valueByVar[reference]
}

export function setCssvar(reference: string, value: string) {
  const id = reference.slice(4, -1)
  style.setProperty(id, value)
  valueByVar[reference] = value
}
