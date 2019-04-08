import _ from './Index.module.scss'
import React from 'react'
import { component } from '../../component'
import { observer } from 'mobx-react'

@observer class HomeIndex extends component({
  inject: ['example'],
  title: '首页',
}) {
  render() {
    return (
      <div>
        <div className={_.page} onClick={() => {
          this.props.example.increaseCounter()
        }}>
          {'inject:'}{this.props.example.counter}
        </div>
        <button onClick={() => this.$router.push('HomeTest')}>go to test</button>
      </div>
    )
  }
}

export default HomeIndex
