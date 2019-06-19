import path from 'path'
import sao from 'sao'

[
  // @index('../src/generators/*', (pp, cc) => `'${pp.name}',`)
  'basic',
  'generator',
  'lib',
  'mp',
  'ssr',
  'web',
  // @endindex
].forEach(generatorName => {
  const generator = path.join(__dirname, '../generators', generatorName)

  test('文件列表正确', async () => {
    const stream = await (sao as any).mock({ generator } as any)
    expect(stream.fileList).toMatchSnapshot()
  })
})
