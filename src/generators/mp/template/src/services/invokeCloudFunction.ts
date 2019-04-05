import Taro from '@tarojs/taro'
import { FunctionName, FunctionParams, FunctionResult, NoParamFunctionName } from '../../cloud/src/functions'

function invokeCloudFunction<T extends FunctionName>(
  functionName: T,
  params: FunctionParams[T],
): Promise<FunctionResult[T]>

function invokeCloudFunction<T extends NoParamFunctionName>(
  functionName: T,
): Promise<FunctionResult[T]>

function invokeCloudFunction(functionName: any, params?: any) {
  return new Promise((resolve, reject) => {
    Taro.cloud.callFunction({
      name: functionName,
      data: params,
      success: res => resolve(res.result),
      fail: reject,
    })
  })
}

export { invokeCloudFunction }
