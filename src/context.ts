import { createContext } from 'react'

import { ExtensionsPopulator } from './useRecord'

const INITIAL_CONTEXT: ExtensionsPopulator<
Record<string,any>,
Record<string,any>
> = () => ({})

export const DRIFTER_CTX = createContext(INITIAL_CONTEXT)