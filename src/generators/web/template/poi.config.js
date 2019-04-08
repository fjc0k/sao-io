module.exports = {
  entry: './src/App.tsx',
  output: {
    publicUrl: './',
    html: {
      title: '',
    },
  },
  plugins: [
    {
      resolve: '@poi/plugin-typescript',
      options: {
        babel: false,
        lintOnSave: false,
        loaderOptions: {
          transpileOnly: true,
        },
      },
    },
  ],
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
