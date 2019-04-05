import globby from 'globby'
import { Config } from 'bili'

const config: Config = {
  input: globby.sync('./src/functions/*[!index].ts'),
  output: {
    format: 'cjs',
    dir: 'dist',
    fileName: '[name]/index[ext]',
  },
  plugins: {
    babel: false,
  },
}

export default config
