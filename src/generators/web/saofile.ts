import { GeneratorConfig } from 'sao'
import { isEmail, isUrl } from 'vtils'

const config: GeneratorConfig<{
  name: string,
  description: string,
  hasMITLicense: boolean,
  author: string,
  email: string,
  homePage: string,
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
      {
        name: 'hasMITLicense',
        message: 'License & MIT',
        type: 'confirm',
        default: false,
      },
      {
        name: 'author',
        message: '作者',
        default: this.gitUser.name,
      },
      {
        name: 'email',
        message: '作者邮箱',
        default: this.gitUser.email,
        validate: isEmail,
      },
      {
        name: 'homePage',
        message: '作者主页',
        default: `https://github.com/${this.gitUser.username}`,
        validate: isUrl,
      },
    ]
  },

  actions() {
    const { answers } = this
    return [
      {
        type: 'add',
        files: '**',
        filters: {
          LICENSE: answers.hasMITLicense,
        },
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
            license: string,
            author: Record<string, string>,
          },
        ) => {
          data.name = answers.name
          data.description = answers.description
          data.author = {
            name: answers.author,
            email: answers.email,
            url: answers.homePage,
          }
          if (!answers.hasMITLicense) {
            delete data.license
          }
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
      ],
    })
    await this.npmInstall({
      packages: [
        'eslint-config-io',
        'stylelint-config-io',
        'typescript',
      ],
      saveDev: true,
    })
    this.showProjectTips()
  },
}

export = config
