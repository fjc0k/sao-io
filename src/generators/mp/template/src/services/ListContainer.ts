import { computed, observable } from 'mobx'

export type ListContainerSource<T = any> = (
  params: {
    page: number,
    limit: number,
  },
) => Promise<T[]>

export class ListContainer<
  Source extends ListContainerSource = ListContainerSource,
  Data extends any[] = Array<Source extends ListContainerSource<infer T> ? T : any>,
> {
  source: Source

  @observable observableData: Data

  page: number

  limit: number

  @observable loading: boolean

  @observable finished: boolean

  lock: boolean

  @computed get data(): Data {
    return this.observableData.slice() as any
  }

  constructor(
    params: {
      source: Source,
      limit: number,
    },
  ) {
    this.reset(params)
  }

  reset(
    params: {
      source: Source,
      limit: number,
    } = {} as any,
  ) {
    if (params.source) {
      this.source = params.source
    }
    if (params.limit) {
      this.limit = params.limit
    }
    this.observableData = [] as any
    this.page = 0
    this.loading = true
    this.finished = false
    this.lock = false
  }

  fetch(reset: boolean = false) {
    return new Promise<this>(resolve => {
      if (this.lock) return
      if (reset) this.reset()
      if (this.finished) return

      this.lock = true
      this.loading = true

      this
        .source({
          page: this.page,
          limit: this.limit,
        })
        .then(data => {
          this.observableData.push(...data)
          if (data.length < this.limit) {
            this.finished = true
          } else {
            this.page++
          }
          this.lock = false
          this.loading = false
          resolve(this)
        })
        .catch(() => {
          this.lock = false
          this.loading = false
        })
    })
  }
}
