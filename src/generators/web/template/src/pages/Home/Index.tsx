import _ from './Index.module.scss'
import React from 'react'
import { component } from '../../component'

export default class HomeIndex extends component({
  title: '首页',
}) {
  render() {
    return (
      <div className={_.page}>
        {'x'}
      </div>
    )
  }
}
