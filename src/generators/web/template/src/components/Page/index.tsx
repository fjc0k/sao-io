import _ from './index.module.scss'
import React from 'react'
import { component } from '../../component'

export class XPage extends component() {
  render() {
    return (
      <div className={_.page}>
        <div className={_.container}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
