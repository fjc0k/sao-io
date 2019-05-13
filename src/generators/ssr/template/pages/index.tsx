import Link from 'next/link'
import React from 'react'
import { component, pageUrls } from '../helpers'

export default class Index extends component() {
  render() {
    return (
      <div>
        <Link href={pageUrls.HomeIndex}>
          <a>
            hello2
          </a>
        </Link>
      </div>
    )
  }
}
