export class Emitter<T> {
  subscribers = new Set<(value: T) => void>()

  emit = (value: T): void => {
    this.subscribers.forEach(callback => callback(value))
  }

  emitAsync = async (value: T): Promise<void> => {
    await Promise.all(Array.from(this.subscribers).map(callback => callback(value)))
  }

  listen = (callback: (value: T) => void): () => void => {
    this.subscribers.add(callback)
    return () => void this.subscribers.delete(callback)
  }

  wait = (predicate?: (value: T) => boolean, ttl = 0): Promise<T> => {
    return new Promise((resolve, reject) => {
      const unsub = this.listen(value => {
        if (!predicate || predicate(value)) {
          unsub()
          clearTimeout(timeout)
          resolve(value)
        }
      })
      const timeout = ttl && setTimeout(() => {
        unsub()
        reject(new Error("Emitter.wait() timed out"))
      }, ttl)
    })
  }
}

export class EmitterVariable<T> extends Emitter<T> {
  constructor(public value: T) {
    super()
  }

  set = (value: T): void => {
    if (value !== this.value) {
      this.value = value
      this.emit(value)
    }
  }
}
