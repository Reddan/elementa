export class Emitter<T> {
  subscribers: Set<(value: T) => void>

  constructor() {
    this.subscribers = new Set()
  }

  emit(value: T): void {
    this.subscribers.forEach(callback => callback(value))
  }

  async emitAsync(value: T): Promise<void> {
    await Promise.all(Array.from(this.subscribers).map(callback => callback(value)))
  }

  listen(callback: (value: T) => void): () => void {
    this.subscribers.add(callback)
    return () => void this.subscribers.delete(callback)
  }

  wait(predicate?: (value: T) => boolean): Promise<T> {
    return new Promise(resolve => {
      const unsub = this.listen(value => {
        if (!predicate || predicate(value)) {
          unsub()
          resolve(value)
        }
      })
    })
  }
}

export class EmitterVariable<T> extends Emitter<T> {
  constructor(public value: T) {
    super()
  }

  set(value: T): void {
    if (value !== this.value) {
      this.value = value
      this.emit(value)
    }
  }
}
