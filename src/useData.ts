import produce, { Draft } from 'immer'
import { useEffect, useMemo, useState } from 'react'

type Updater<G> = (draft: Draft<G>) => Draft<G>|undefined|void

function copy<T extends Record<string, any>> (obj1: T, obj2: T) {
  for (let key in obj1) {
    obj1[key] = obj2[key]
  }
}

function createSelect<G> (data: G, onUpdate: (updater: (draft: Draft<G>) => void) => void) {
  return <T>(selector: (data: G) => T) => {
    const selectedState = selector(data)

    const update = (updater: Updater<T>) => (
      onUpdate((draft) => {
        const selectedDraft = selector(draft as G) as Draft<T>
        const result = updater(selectedDraft)

        if (result) {
          copy(selectedDraft, result)
        }
      })
    )


    return [
      selectedState,
      {
      /**
       * @description 
       * .update() uses [produce from immerjs](https://immerjs.github.io/immer/docs/produce) to allow you to mutate your state in a pure way.
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

  useEffect(() => void setState(data), [data])

  return useMemo(() => {
    const rootSelect = createSelect(state, (updater) => setState(produce(state, updater)))

    return rootSelect(data => data)
  }, [state])
}
