export const pageUrls = {
  // @index('./**/*.tsx', (pp, cc) => `${pp.path.replace(/[^a-zA-Z]/g, '')}: '${pp.path.replace('./', '/pages/')}' as '${pp.path.replace('./', '/pages/')}',`)
  HomeIndex: '/pages/Home/Index' as '/pages/Home/Index',
  // @endindex
}

// @index('./**/*.tsx', (pp, cc) => `import ${pp.path.replace(/[^a-zA-Z]/g, '')} from '${pp.path}'`)
import HomeIndex from './Home/Index'
// @endindex

export type Pages = {
  // @index('./**/*.tsx', (pp, cc) => `${pp.path.replace(/[^a-zA-Z]/g, '')}: ${pp.path.replace(/[^a-zA-Z]/g, '')},`)
  HomeIndex: HomeIndex,
  // @endindex
}

export type PageName = keyof Pages
