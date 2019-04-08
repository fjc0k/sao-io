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
      <div className={_.page} onClick={() => {
        this.props.example.increaseCounter()
      }}>
        {'inject:'}{this.props.example.counter}
      </div>
    )
  }
}

export default HomeIndex
