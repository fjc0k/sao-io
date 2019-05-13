import axios from 'axios'
import Head from 'next/head'
import React from 'react'
import styles from './index.module.less'
import { component } from '../../helpers'
import { imgTest } from '../../static'

export default class HomeIndex extends component({
  props: {
    name: '' as string,
  },
  async prepare() {
    return {
      name: (await axios.get('https://api.github.com/repos/zeit/next.js')).data.name,
    }
  },
}) {
  render() {
    return (
      <div>
        <Head>
          <title>hoho</title>
        </Head>
        <span className={styles.name}>
          {this.props.name}
        </span>
        <img src={imgTest} />
      </div>
    )
  }
}
