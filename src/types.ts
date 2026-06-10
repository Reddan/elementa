export type Prettify<T> = {[K in keyof T]: T[K]} & {}
export type Unwrapable<A extends any[], T> = T | ((...args: A) => T)
