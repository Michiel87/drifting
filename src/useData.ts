import produce, { Draft } from 'immer'
import { useEffect, useMemo, useState } from 'react'

type AnyFunction = (...args: any[]) => any

type Slice<T extends AnyFunction> = T extends (...args: any[]) => infer R
  ? R
  : never

type UpdateCb<G> = (args: Draft<G>) => G|void|undefined

function createReturnedTuple<G> (nextDataState: G, updateFn: (cb: UpdateCb<G>) => void) {
  return <T extends (slice: G) => any>(getSelected: T) => {
    const selectedDataState: Slice<T> = getSelected(nextDataState)

    const update = (updateSelected: UpdateCb<Slice<T>>) => (
      updateFn((draft) => updateSelected(getSelected(draft as G)))
    )

    return [
      selectedDataState,
      {
      /**
       * @description 
       * Use .update() to make mutations, like with immer, to your data structure. 
       * @example 
       * ```typescript
       * [[include:update.example.ts]]
       * ```
      */
        update,
      /**
       * @description 
       * Narrow down the state and updater by using .select()
       * @example 
       * ```typescript
       * [[include:select.example.ts]]
       * ```
      */
        select: createReturnedTuple<Slice<T>>(selectedDataState, update)
      }
    ] as const
  }
}

type Data = (Record<string, unknown>|Record<string, unknown>[])

export function useData<T extends Data = Record<string, unknown>> (data: T) {
  const [nextDataState, setDataState] = useState<T>(data)

  useEffect(() => {
    setDataState(data)
  }, [data])

  return useMemo(() => {
    return createReturnedTuple(
      nextDataState, 
      (updater) => void (setDataState(produce(nextDataState, updater) as T))
    )(data => data)
  }, [nextDataState])
}
