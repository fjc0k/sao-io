import Taro from '@tarojs/taro'
import { castArray, isBoolean, isNumber, mapValues, objectToQueryString, Omit, pick, Validator, ValidatorRule } from 'vtils'
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
    enableGlobalClass = false,
    inject = [] as any,
    props = {} as any,
    state = {} as any,
    lists = {} as any,
    params = {} as any,
    rules = null,
  }: {
    enableGlobalClass?: boolean,
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
  > extends Taro.PureComponent<
    Overwrite<PP, ExtraProps>,
    Overwrite<SS, ExtraState>
  > {
    static options = {
      addGlobalClass: enableGlobalClass,
    }

    static defaultProps: P = defaultProps

    private __validator__ = new Validator(rules)

    get params(): Params {
      return mapValues(
        {
          ...params,
          ...(this.$router.params || {}),
        },
        (value, key) => {
          if (isNumber(params[key])) {
            return Number(value)
          }
          if (isBoolean(params[key])) {
            return value === true || value === 'true'
          }
          return value
        },
      ) as any
    }

    constructor() {
      super(...arguments)
      this.props = defaultProps as any
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
    }

    goto<P extends PageName>(pageName: P, params: Pages[P]['params'] = {} as any) {
      Taro.navigateTo({
        url: `${pageUrls[pageName]}?${objectToQueryString(params)}`,
      })
    }

    validate = <K extends keyof S>(keys: K | K[] = Object.keys(rules) as any): Promise<void> => {
      return new Promise(resolve => {
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
              Taro.showToast({
                title: res.message,
                icon: 'none',
              })
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
