/**
 * polyfills
 */
import 'core-js/features/array/find-index'
import 'core-js/features/object/assign'
import 'core-js/features/promise'

/**
 * 移动端自适应
 */
import { flexible } from 'vtils'

flexible({
  getViewWidth: () => {
    const docEl = document.documentElement
    return Math.min(docEl.clientWidth, docEl.clientHeight)
  },
})
