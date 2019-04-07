import path from 'path'
import { GeneratorConfig } from 'sao'

const config: GeneratorConfig = {
  actions() {
    return [
      {
        type: 'add',
        files: '**',
        transform: false,
      },
      {
        type: 'move',
        patterns: require('./move.json'),
      },
    ]
  },

  async completed() {
    await this.npmInstall({
      cwd: path.join(this.outDir, 'template'),
    })
    this.showProjectTips()
  },
}

export = config
