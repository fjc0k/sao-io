import Taro from '@tarojs/taro'
import { isFunction, wait } from 'vtils'

/**
 * 异步任务一般有两种状态：处理中、处理完成。
 * 这个函数就是为了简化这两种状态。
 */
export async function submit(
  params: {
    loadingText: string,
    loadedText: string,
    action: ((...args: any[]) => any) | Promise<any>,
    onLoaded?: () => void,
  },
) {
  Taro.showLoading({
    title: params.loadingText,
  })
  await (isFunction(params.action) ? params.action() : params.action)
  params.onLoaded && params.onLoaded()
  Taro.hideLoading()
  Taro.showToast({
    title: params.loadedText,
    icon: 'success',
    duration: 1500,
  })
  await wait(1500)
}
