import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'

(async () => {
  const srcGeneratorsPath = path.join(__dirname, '../src/generators')
  const destGeneratorsPath = path.join(__dirname, '../generators')

  const generators = await globby(
    '*',
    {
      cwd: srcGeneratorsPath,
      onlyDirectories: true,
    },
  )

  generators.forEach(async generator => {
    const generatorDir = path.join(srcGeneratorsPath, generator)
    const configFile = path.join(generatorDir, 'config.json')

    const { templateDir = 'template' } = (
      await fs.pathExists(configFile)
        ? await fs.readJSON(configFile)
        : {} as any
    )

    const absoluteTemplateDir = path.resolve(generatorDir, templateDir)

    const files = await globby(
      path.resolve(absoluteTemplateDir, '**/*'),
      {
        gitignore: true,
        dot: true,
      },
    )

    const moveMap: Record<string, string> = {}

    await Promise.all(
      files.map(async file => {
        const pp = path.parse(file)

        let targetFileName = pp.base

        if (targetFileName.endsWith('.tpl')) {
          if (files.includes(path.join(pp.dir, targetFileName.slice(0, -4)))) {
            targetFileName = targetFileName.slice(0, -4)
          }
        } else {
          if (files.includes(path.join(pp.dir, `${targetFileName}.tpl`))) {
            file = path.join(pp.dir, `${targetFileName}.tpl`)
          }
        }

        if (targetFileName.charAt(0) === '.' || targetFileName === 'package.json') {
          targetFileName = `${targetFileName}.tpl`
          moveMap[
            path.relative(
              absoluteTemplateDir,
              path.join(pp.dir, targetFileName),
            )
          ] = path.relative(absoluteTemplateDir, file)
        }

        await fs.copy(file, `${
          path.join(
            destGeneratorsPath,
            generator,
            'template',
            path.relative(
              absoluteTemplateDir,
              path.join(pp.dir, targetFileName),
            ),
          )
        }`)
      }),
    )

    await fs.writeJSON(
      path.join(destGeneratorsPath, generator, 'move.json'),
      moveMap,
      {
        spaces: 2,
      },
    )
  })
})()
