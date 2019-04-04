import { action, observable } from 'mobx'

/** 示例 */
class Example {
  /** 计数器 */
  @observable counter: number = 0

  /** 计数器加一 */
  @action increaseCounter() {
    this.counter++
  }
}

export default new Example()
