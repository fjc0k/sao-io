// @index('./*.ts', (pp, cc) => `import ${pp.name} from '${pp.path}'`)
import example from './example'
// @endindex

export const stores = {
  // @index('./*.ts', (pp, cc) => `${pp.name},`)
  example,
  // @endindex
}

export type Stores = typeof stores

export type StoreName = keyof Stores
