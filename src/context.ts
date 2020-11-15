import { createContext } from 'react'

import { ExtensionsPopulator } from './useData'

const INITIAL_CONTEXT: ExtensionsPopulator<
Record<string,any>,
Record<string,any>
> = () => ({})

export const DRIFTER_CTX = createContext(INITIAL_CONTEXT)
