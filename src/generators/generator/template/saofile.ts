import path from 'path'
import spawn from 'cross-spawn'
import { GeneratorConfig } from 'sao'

const config: GeneratorConfig<{
  name: string,
}> = {
  prompts() {
    return [
      {
      }
    ]
  },

  actions() {
    const { answers } = this
    return [
      {
        type: 'add',
        files: '**'
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
    const { answers } = this
    this.gitInit()
    await this.npmInstall({
      packages: [
        'mounted',
        'vtils',
      ],
    })
    if (answers.enableCloudFunction) {
      const cloudDir = path.join(this.outDir, 'cloud')
      await this.npmInstall({
        cwd: cloudDir,
        packages: [
          'vtils',
        ],
      })
      this.spinner.start('<云函数> npm run build')
      spawn.sync('npm', ['run', 'build'], {
        cwd: cloudDir,
      })
      this.spinner.stop()
      this.logger.success('<云函数> 构建成功')
    }
    this.showProjectTips()
  },
}

export = config
