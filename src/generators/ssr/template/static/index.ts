// @index('./images/**/*', (pp, cc) => `export const img${cc.upperCaseFirst(pp.name)} = '/static/${pp.path.replace('./', '')}${pp.ext}'`)
export const imgTest = '/static/images/test.svg'
// @endindex

// @index('./styles/**/*', (pp, cc) => `export const css${cc.upperCaseFirst(pp.name)} = '/static/${pp.path.replace('./', '')}${pp.ext}'`)
export const cssNprogress = '/static/styles/nprogress.css'
// @endindex
