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
  // @index('./*', (pp, cc) => `${pp.name}: Functions['${pp.name}'] extends (...args: infer T) => any ? T[0] : never,`)
  demo: Functions['demo'] extends (...args: infer T) => any ? T[0] : never,
  getUserInfo: Functions['getUserInfo'] extends (...args: infer T) => any ? T[0] : never,
  // @endindex
}

export interface FunctionResult extends Record<FunctionName, any> {
  // @index('./*', (pp, cc) => `${pp.name}: Functions['${pp.name}'] extends (...args: any[]) => Promise<infer T> ? T : never,`)
  demo: Functions['demo'] extends (...args: any[]) => Promise<infer T> ? T : never,
  getUserInfo: Functions['getUserInfo'] extends (...args: any[]) => Promise<infer T> ? T : never,
  // @endindex
}

export type NoParamFunctionName = {
  [K in FunctionName]: FunctionParams[K] extends undefined ? K : never
}[FunctionName]

export {
  // @index('./*', (pp, cc) => `${pp.name},`)
  demo,
  getUserInfo,
  // @endindex
}
