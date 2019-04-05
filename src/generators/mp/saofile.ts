import { GeneratorConfig } from 'sao'
import { isEmail } from 'vtils'

const config: GeneratorConfig<{
  name: string,
  description: string,
  enableCloud: boolean,
  enableCloudFunction: boolean,
  appid: string,
  designWidth: number,
  author: string,
  email: string,
}> = {
  prompts() {
    return [
      {
        name: 'name',
        message: '小程序名称',
        default: this.outFolder,
        validate: v => /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(v),
      },
      {
        name: 'description',
        message: '小程序描述',
        default: `一个小程序项目。`,
      },
      {
        name: 'enableCloud',
        message: '是否使用云开发',
        type: 'confirm',
        default: false,
      },
      {
        name: 'enableCloudFunction',
        message: '是否使用云函数',
        type: 'confirm',
        default: true,
        when: a => a.enableCloud,
      },
      {
        name: 'appid',
        message: 'AppID',
        default: 'wx15002fb034d4fb9a',
      },
      {
        name: 'designWidth',
        message: 'UI设计稿尺寸',
        type: 'list',
        choices: ['375', '640', '750', '828'],
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
    ]
  },

  actions() {
    const { answers } = this
    return [
      {
        type: 'add',
        files: '**',
        filters: {
          'cloud/**/*': answers.enableCloudFunction,
          'src/services/invokeCloudFunction.ts': answers.enableCloudFunction,
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
            author: string,
          },
        ) => {
          data.name = answers.name
          data.description = answers.description
          data.author = `${answers.author} <${answers.email}>`
          return data
        },
      },
      {
        type: 'modify',
        files: 'project.config.json',
        handler: (
          data: {
            projectname: string,
            description: string,
            appid: string,
            cloudfunctionRoot: string,
            cloudfunctionTemplateRoot: string,
          },
        ) => {
          data.projectname = answers.name
          data.description = answers.description
          data.appid = answers.appid
          if (!answers.enableCloudFunction) {
            delete data.cloudfunctionRoot
            delete data.cloudfunctionTemplateRoot
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
        'mounted',
        'vtils',
      ],
    })
    this.showProjectTips()
  },
}

export = config
