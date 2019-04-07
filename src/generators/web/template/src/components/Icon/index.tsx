import _ from './index.module.scss'
import React from 'react'
import { component, RequiredProp } from '../../component'

export class XIcon extends component({
  props: {
    name: '' as any as RequiredProp<''>,
  },
}) {
  render() {
    const { name, className } = this.props
    return (
      <span
        className={`${_.iconfont} icon-${_[`icon-${name}`]} ${className}`}
      />
    )
  }
}
