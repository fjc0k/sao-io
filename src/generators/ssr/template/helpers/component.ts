import React from 'react'
import { NextContext } from 'next'
import { Omit } from 'vtils'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredProp<T = any> = {
  __REQUIRED__: true,
  __TYPE__: T,
}
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export const component = <
  P extends Record<string, any>,
  S extends Record<string, any>,
  PP = (
    Overwrite<
      PartialBy<
        { [K in keyof P]: P[K] extends RequiredProp<infer T> ? T : P[K] },
        { [K in keyof P]: P[K] extends RequiredProp ? never : K }[keyof P]
      >,
      {
        /** 应用级别、页面级别的类 */
        className?: string,
      }
    >
  ),
  SS = S
>(
  {
    props = {} as any,
    state = {} as any,
    prepare = () => ({}) as any,
  }: {
    props?: P,
    state?: S,
    /**
     * 从 `服务器端` 或者 `浏览器端` 首次进入页面时准备初始的属性列表。`(仅可在页面上使用)`
     */
    prepare?: (ctx: NextContext) => Partial<P> | Promise<Partial<P>>,
  } = {} as any,
) => {
  const defaultProps = props

  return class Component<
    ExtraProps extends Record<string, any> = {},
    ExtraState extends Record<string, any> = {}
  > extends React.Component<
    Overwrite<PP, ExtraProps>,
    Overwrite<SS, ExtraState>
  > {
    static defaultProps: P = defaultProps

    static getInitialProps = prepare

    constructor() {
      // @ts-ignore
      super(...arguments)
      this.state = state as any
    }
  }
}
