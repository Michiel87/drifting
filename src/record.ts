import { useState, useEffect, createContext, useContext, useMemo } from 'react'
import produce, { Draft } from "immer"

type Extensions<T> = ({
  drifting,
  initialState,
  nextState
}: {
  drifting: (draft: Draft<T>) => void
  initialState: T
  nextState: T
}) => Record<string, any>

const DRIFTER_CTX = createContext((() => ({
  save: 'here i am'
})) as Extensions<any>)

export function useRecord<T extends Record<string, any>> (record: T) {
  const extensions = useContext(DRIFTER_CTX)
  const [nextState, setState] = useState<T>(record)

  useEffect(() => {
    setState(record)
  }, [record])

  function drifting (drafter: (args: Draft<T>) => void) {
    setState(
      produce(nextState, drafter)
    )
  }

  return useMemo(() => [
    nextState,
    {
      draft: drifting,
      ...extensions({ drifting, initialState: record, nextState })
    }
  ] as const, [nextState, extensions])
}


// function Example () {
//   const [record, controller] = useRecord(record)

//   controller.draft(budget => {
//     operations(budget.relationships.budgetitems)
//       .remove('10')
//       .add(record)
//   })

//   controller.save()
// }


