import { GeneratorConfig } from 'sao'
import { isEmail, isUrl } from 'vtils'

const config: GeneratorConfig<{
  name: string,
  description: string,
  type: 'pc' | 'mobile' | 'wechat',
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
        name: 'type',
        message: '项目类型',
        type: 'list',
        choices: ['pc', 'mobile', 'wechat'],
        default: 'wechat',
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
        transformExclude: [
          'public/index*.html',
        ],
        filters: {
          'public/index.html': false,
          'public/index.pc.html': answers.type === 'pc',
          'public/index.mobile.html': answers.type === 'mobile',
          'public/index.wechat.html': answers.type === 'wechat',
        },
      },
      {
        type: 'move',
        patterns: {
          ...require('./move.json'),
          'public/index.*.html': 'public/index.html',
        },
      },
      {
        type: 'modify',
        files: 'package.json',
        handler: (
          data: {
            name: string,
            description: string,
            author: Record<string, string>,
            browserslist: any,
            postcss: {
              plugins: {
                'postcss-pxtorem': any,
              },
            },
          },
        ) => {
          data.name = answers.name
          data.description = answers.description
          data.author = {
            name: answers.author,
            email: answers.email,
            url: answers.homePage,
          }
          if (answers.type === 'pc') {
            data.browserslist = [
              'ie > 10',
              'last 2 versions',
            ]
            delete data.postcss.plugins['postcss-pxtorem']
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
        'conventional-changelog-lint-config-io',
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
