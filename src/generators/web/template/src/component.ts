import React from 'react'
import { castArray, mapValues, Omit, pick, Validator, ValidatorRule } from 'vtils'
import { isFunction } from 'vtils'
import { ListContainer } from './services'
import { PageName, Pages, pageUrls } from './pages'
import { StoreName, stores, Stores } from './store'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
type RequiredProp<T = any> = {
  __REQUIRED__: true,
  __TYPE__: T,
}
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

type Source = (...args: any) => Promise<any[]>

const component = <
  P extends Record<string, any>,
  S extends Record<string, any>,
  L extends Record<string, Source | {
    source: Source,
    extraData?: (this: { props: PP, state: SS }) => Record<string, any>,
  }>,
  Params extends Record<string, any>,
  Rules extends { [key in keyof S]?: ValidatorRule | ValidatorRule[] },
  InjectStoreName extends StoreName = null,
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
  ) & ({ [K in InjectStoreName]?: Stores[K] }),
  SS = S & {
    [K in keyof L]: ListContainer<
      L[K] extends Source
        ? L[K]
        : L[K] extends { source: Source }
          ? L[K]['source']
          : any
    >
  }
>(
  {
    title = '' as any,
    inject = [] as any,
    props = {} as any,
    state = {} as any,
    lists = {} as any,
    params = {} as any,
    rules = null,
  }: {
    title?: string,
    inject?: InjectStoreName[],
    props?: P,
    state?: S,
    lists?: L,
    params?: Params,
    rules?: Rules,
  } = {} as any,
) => {
  const defaultProps = {
    ...inject.reduce<any>((res, storeName) => {
      res[storeName] = stores[storeName]
      return res
    }, {}),
    ...props,
  }
  return class Component<
    ExtraProps extends Record<string, any> = {},
    ExtraState extends Record<string, any> = {}
  > extends React.Component<
    Overwrite<PP, ExtraProps>,
    Overwrite<SS, ExtraState>
  > {
    static defaultProps: P = defaultProps

    private __validator__ = new Validator(rules)

    defaultParams: Params = {} as any

    $router: {
      push<T extends PageName>(pageName: T, params?: Pages[T]['defaultParams']): void,
      replace<T extends PageName>(pageName: T, params?: Pages[T]['defaultParams']): void,
      back(): void,
    } = {} as any

    get params(): Params {
      return {
        ...params,
        ...(this.props.location.state || {}),
      }
    }

    constructor() {
      // @ts-ignore
      super(...arguments)
      this.state = Object.assign(
        state,
        mapValues(lists, (list: any) => {
          const listContainer = new ListContainer({
            source: params => {
              if (isFunction(list)) {
                return list({
                  page: params.page,
                  limit: params.limit,
                })
              }
              return list.source({
                page: params.page,
                limit: params.limit,
                ...(list.extraData ? list.extraData.call(this) : {}),
              })
            },
            limit: 20,
          })
          return listContainer
        }),
      ) as any
      this.$router = {
        push: (pageName, params) => {
          this.props.history.push(pageUrls[pageName], params)
        },
        replace: (pageName, params) => {
          this.props.history.replace(pageUrls[pageName], params)
        },
        back: () => {
          this.props.history.goBack()
        },
      }
      if (title != null) {
        const componentDidMount = this.componentDidMount
        const componentWillUnmount = this.componentWillUnmount
        this.componentDidMount = () => {
          (this as any).prevTitle = document.title
          document.title = title
          componentDidMount && componentDidMount.call(this)
        }
        this.componentWillUnmount = () => {
          document.title = (this as any).prevTitle
          componentWillUnmount && componentWillUnmount.call(this)
        }
      }
    }

    validate = <K extends keyof S>(keys: K | K[] = Object.keys(rules) as any): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.__validator__
          .validate(
            (
              (keys as any).length === 0
                ? this.state
                : pick(this.state, castArray(keys) as any)
            ) as any,
          )
          .then(res => {
            if (res.valid === true) {
              resolve()
            } else {
              reject(res.message)
            }
          })
      })
    }
  }
}

export {
  RequiredProp,
  component,
}
