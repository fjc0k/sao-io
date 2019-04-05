import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'

const srcGeneratorsPath = path.join(__dirname, '../generators')
const destGeneratorsPath = path.join(__dirname, '../../generators')

const files = globby.sync(path.join(srcGeneratorsPath, '*/template/**/*'), {
  gitignore: true,
  dot: true,
})

const moveMapByGenerator: Record<string, Record<string, string>> = Object.create(null)

files.forEach(file => {
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
    const generator = file.replace(/\\/g, '/').match(/generators\/(.+?)\//)![1]
    if (!moveMapByGenerator[generator]) {
      moveMapByGenerator[generator] = {}
    }
    moveMapByGenerator[generator][
      path.relative(
        path.join(srcGeneratorsPath, `${generator}/template`),
        path.join(pp.dir, targetFileName),
      )
    ] = path.relative(
      path.join(srcGeneratorsPath, `${generator}/template`),
      file,
    )
  }

  fs.copySync(file, `${
    path.join(
      destGeneratorsPath,
      path.relative(
        srcGeneratorsPath,
        path.join(pp.dir, targetFileName),
      ),
    )
  }`)
})

Object.keys(moveMapByGenerator).forEach(generator => {
  fs.writeJSONSync(
    path.join(destGeneratorsPath, `${generator}/move.json`),
    moveMapByGenerator[generator],
  )
})
