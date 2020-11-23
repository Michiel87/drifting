import produce, { Draft } from 'immer'
import { useEffect, useMemo, useState } from 'react'

type Updater<G> = (draft: Draft<G>) => void

function createSelect<G> (data: G, onUpdate: (updater: Updater<G>) => void) {
  return <T>(selector: (data: G) => T) => {
    const selectedState = selector(data)

    const update = (updater: Updater<T>) => (
      onUpdate((draft) => updater(selector(draft as G) as Draft<T>) as any)
    )

    return [
      selectedState,
      {
      /**
       * @description 
       * .update() uses immer to allow you to mutate your state in a pure way.
       * Read more about immer: https://immerjs.github.io/immer/docs/produce
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
        select: createSelect(selectedState, update)
      }
    ] as const
  }
}

type Data = (Record<string, unknown>|Record<string, unknown>[])

export function useData<T extends Data = Record<string, unknown>> (data: T) {
  const [state, setState] = useState(data)

  useEffect(() => { setState(data) }, [data])

  return useMemo(() => {
    const rootSelect = createSelect(state, (updater) => setState(produce(state, updater)))

    return rootSelect(data => data)
  }, [state])
}
