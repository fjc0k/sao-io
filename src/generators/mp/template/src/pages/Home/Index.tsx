import './Index.scss'
import Taro from '@tarojs/taro'
import { Button, View } from '@tarojs/components'
import { component } from '../../component'
import { observer } from '@tarojs/mobx'
import { XPage } from '../../components'

@observer class HomeIndex extends component({
  inject: ['example'],
}) {
  config: Taro.Config = {
    navigationBarTitleText: '首页',
  }

  render() {
    const { example: { counter } } = this.props
    return (
      <XPage>
        <View>{counter}</View>
        <Button
          onClick={() => {
            this.props.example.increaseCounter()
          }}>
          {`counter =+ 1`}
        </Button>
      </XPage>
    )
  }
}

export default HomeIndex
