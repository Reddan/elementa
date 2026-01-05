import hash from "object-hash"
import {assert, zip} from "./utils"

type Options = {
  cache?: boolean
  size?: number
  timeout?: number
}

export function dedupedBatch<T, U>(callback: (inputs: T[]) => Promise<U[]>, options: Options = {}) {
  const {cache = false, size, timeout} = options
  const inputByHash = new Map<string, T>()
  const outputByHash = new Map<string, U>()
  const onOutputByHash: Record<string, [(output: U) => void, (reason?: any) => void][]> = {}
  let batchTimeout: number

  const submit = () => {
    const hashes = inputByHash.keys().toArray()
    const inputs = inputByHash.values().toArray()
    inputByHash.clear()
    callback(inputs).then(outputs => {
      for (const [valueHash, output] of zip(hashes, outputs)) {
        if (cache) {
          outputByHash.set(valueHash, output)
        }
        onOutputByHash[valueHash]!.forEach(([resolve]) => resolve(output))
        delete onOutputByHash[valueHash]
      }
    }).catch(err => {
      for (const valueHash of hashes) {
        onOutputByHash[valueHash]!.forEach(([, reject]) => reject(err))
        delete onOutputByHash[valueHash]
      }
    })
  }

  return (input: T) => new Promise<U>((resolve, reject) => {
    const valueHash = hash(input ?? null)
    if (outputByHash.has(valueHash)) {
      return resolve(outputByHash.get(valueHash)!)
    }
    const onOutput = onOutputByHash[valueHash] ??= []
    onOutput.push([resolve, reject])
    if (onOutput.length > 1) return
    inputByHash.set(valueHash, input)
    clearTimeout(batchTimeout)
    if (size && inputByHash.size >= size) {
      submit()
    } else {
      batchTimeout = setTimeout(submit, timeout)
    }
  })
}

export function deduped<T extends any[], U>(callback: (...input: T) => Promise<U>, options: Omit<Options, "size"> = {}) {
  const batched = dedupedBatch(async (inputs: T[]): Promise<U[]> => {
    assert(inputs.length === 1)
    return [await callback(...inputs[0]!)]
  }, {cache: true, ...options, size: 1})

  return (...input: T) => batched(input)
}
