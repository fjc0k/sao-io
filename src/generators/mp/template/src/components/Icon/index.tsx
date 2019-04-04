import './index.scss'
import Taro from '@tarojs/taro'
import { component, RequiredProp } from '../../component'
import { Text } from '@tarojs/components'

export default class XIcon extends component({
  enableGlobalClass: true,
  props: {
    name: '' as any as RequiredProp<''>,
  },
}) {
  render() {
    const { name, className } = this.props
    return (
      <Text className={`iconfont icon-${name} ${className}`} />
    )
  }
}
