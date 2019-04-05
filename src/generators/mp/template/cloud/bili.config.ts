import globby from 'globby'
import { Config } from 'bili'

const config: Config = {
  input: globby.sync('./src/functions/*[!index].ts'),
  output: {
    format: 'cjs-min',
    dir: 'dist',
    fileName: '[name]/index[ext]',
    sourceMap: false,
  },
  plugins: {
    babel: false,
  },
  bundleNodeModules: true,
  externals: ['wx-server-sdk'],
}

export default config
