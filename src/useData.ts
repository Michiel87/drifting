import { useState, useEffect, useMemo } from 'react'
import produce, { Draft } from 'immer'

function createSelect (nextState: any, updater: any) {
  return (selector: any) => {
    const slicedNextState = selector(nextState)

    return [
      slicedNextState,
      {
        update: (cb: any) => updater((state: any) => cb(selector(state))),
        select: createSelect(slicedNextState, (cb: any) => updater((state: any) => cb(selector(state)) )
      }
    ]
  }
}

export function useData<
  T extends (Record<string, any>|Record<string, any>[]) = Record<string, any>
> (record: T) {
  const [nextState, setState] = useState<T>(record)

  useEffect(() => {
    setState(record)
  }, [record])

  function updater (updater: (args: Draft<T>) => void) {
    setState(produce(nextState, updater))
  }

  return useMemo(() => [
    nextState,
    {
      update: updater,
      select: createSelect(nextState, updater)
    }
  ] as const, [nextState])
}