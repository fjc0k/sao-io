import { GeneratorConfig } from 'sao'

const config: GeneratorConfig = {
  actions() {
    return [
      {
        type: 'add',
        files: '**',
      },
      {
        type: 'move',
        patterns: require('./move.json'),
      },
    ]
  },

  async completed() {
    this.showProjectTips()
  },
}

export = config
