import Document, { Head, Main, NextScript } from 'next/document'
import React from 'react'
import { cssNprogress } from '../static'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <html>
        <Head>
          <link rel='stylesheet' type='text/css' href={cssNprogress} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
