import { Config } from 'bili'

const config: Config = {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: ['cjs', 'esm'],
  },
}

export default config
