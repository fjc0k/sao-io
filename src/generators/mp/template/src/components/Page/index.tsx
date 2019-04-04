import './index.scss'
import Taro from '@tarojs/taro'
import { component } from '../../component'
import { View } from '@tarojs/components'

export default class XPage extends component() {
  render() {
    return (
      <View className='page'>
        <View className='container'>
          {this.props.children}
        </View>
      </View>
    )
  }
}
