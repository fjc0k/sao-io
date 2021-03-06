export const pageUrls = {
  // @index('./**/*.tsx', (pp, cc) => `${pp.path.replace(/[^a-zA-Z]/g, '')}: '${pp.path.replace('./', '/').replace('Home/Index', '')}' as '${pp.path.replace('./', '/').replace('Home/Index', '')}',`)
  HomeIndex: '/' as '/',
  HomeTest: '/Home/Test' as '/Home/Test',
  // @endindex
}

// @index('./**/*.tsx', (pp, cc) => `import ${pp.path.replace(/[^a-zA-Z]/g, '')} from '${pp.path}'`)
import HomeIndex from './Home/Index'
import HomeTest from './Home/Test'
// @endindex

export type Pages = {
  // @index('./**/*.tsx', (pp, cc) => `${pp.path.replace(/[^a-zA-Z]/g, '')}: ${pp.path.replace(/[^a-zA-Z]/g, '')},`)
  HomeIndex: HomeIndex,
  HomeTest: HomeTest,
  // @endindex
}

export const pages = {
  // @index('./**/*.tsx', (pp, cc) => `${pp.path.replace(/[^a-zA-Z]/g, '')}: ${pp.path.replace(/[^a-zA-Z]/g, '')},`)
  HomeIndex: HomeIndex,
  HomeTest: HomeTest,
  // @endindex
}

export type PageName = keyof Pages

export const pageNames = [
  // @index('./**/*.tsx', (pp, cc) => `'${pp.path.replace(/[^a-zA-Z]/g, '')}' as '${pp.path.replace(/[^a-zA-Z]/g, '')}',`)
  'HomeIndex' as 'HomeIndex',
  'HomeTest' as 'HomeTest',
  // @endindex
]
