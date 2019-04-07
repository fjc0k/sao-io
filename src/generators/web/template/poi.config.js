module.exports = {
  entry: './src/App.tsx',
  output: {
    publicUrl: '.',
    html: {
      title: '',
    },
  },
  chainWebpack: config => {
    config.module
      .rule('media')
      .test(/\.(mp3|mp4|aac|m4a)$/)
      .use('file')
      .loader('file-loader')
      .options({
        name: 'assets/media/[path][name].[hash:8].[ext]',
      })
  },
}
