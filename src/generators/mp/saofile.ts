import * as vtils from 'vtils'
import { GeneratorConfig } from 'sao'
import { isNil } from 'vtils'

const config: GeneratorConfig<{
  name: string,
  description: string,
  appid: string,
  designWidth: number,
  author: string,
  email: string,
}> = {
  templateData: {
    vtils: vtils,
  },
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
        name: 'designWidth',
        message: 'UI设计稿尺寸',
        type: 'list',
        choices: ['375', '640', '750', '828'],
      },
      {
        name: 'appid',
        message: 'AppID',
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
        validate: vtils.isEmail,
      },
    ]
  },
  actions() {
    return [
      {
        type: 'add',
        files: '**',
      },
      {
        type: 'move',
        patterns: {
          '_gitattributes': '.gitattributes',
          '_gitignore': '.gitignore',
          '_package.json': 'package.json',
        },
      },
      {
        type: 'modify',
        files: ['package.json', 'project.config.json'],
        handler: (
          data: {
            name: string,
            description: string,
            author: string,
            projectname: string,
            appid: string,
          },
        ) => {
          (['name', 'description', 'author', 'projectname', 'appid'] as Array<keyof typeof data>)
            .forEach(key => {
              if (!isNil(data[key])) {
                data[key] = (this.answers as any)[key] || data[key]
              }
            })
          return data
        },
      },
    ]
  },
}

export = config
