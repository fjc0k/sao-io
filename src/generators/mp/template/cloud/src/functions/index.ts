// @index('./*', (pp, cc) => `import { main as ${pp.name} } from '${pp.path}'`)
import { main as demo } from './demo'
import { main as getUserInfo } from './getUserInfo'
// @endindex

export interface Functions {
  // @index('./*', (pp, cc) => `${pp.name}: typeof ${pp.name},`)
  demo: typeof demo,
  getUserInfo: typeof getUserInfo,
  // @endindex
}

export type FunctionName = keyof Functions

export interface FunctionParams extends Record<FunctionName, any> {
  // @index('./*', (pp, cc) => `${pp.name}: Functions['${pp.name}'] extends (_: infer T) => any ? T : never,`)
  demo: Functions['demo'] extends (_: infer T) => any ? T : never,
  getUserInfo: Functions['getUserInfo'] extends (_: infer T) => any ? T : never,
  // @endindex
}

export {
  // @index('./*', (pp, cc) => `${pp.name},`)
  demo,
  getUserInfo,
  // @endindex
}
