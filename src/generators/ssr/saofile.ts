import { GeneratorConfig } from 'sao'

const config: GeneratorConfig<{
  name: string,
  description: string,
}> = {
  prompts() {
    return [
      {
        name: 'name',
        message: '项目名称',
        default: this.outFolder,
        validate: v => /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(v),
      },
      {
        name: 'description',
        message: '项目描述',
        default: `A project.`,
      },
    ]
  },

  actions() {
    const { answers } = this
    return [
      {
        type: 'add',
        files: '**',
      },
      {
        type: 'move',
        patterns: require('./move.json'),
      },
      {
        type: 'modify',
        files: 'package.json',
        handler: (
          data: {
            name: string,
            description: string,
          },
        ) => {
          data.name = answers.name
          data.description = answers.description
          return data
        },
      },
    ]
  },

  async completed() {
    this.gitInit()
    await this.npmInstall({
      packages: [
        'vtils',
        'typescript',
      ],
    })
    await this.npmInstall({
      packages: [
        'commitlint-config-io',
        'eslint-config-io',
      ],
      saveDev: true,
    })
    this.showProjectTips()
  },
}

export = config
