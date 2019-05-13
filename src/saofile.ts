import { GeneratorConfig } from 'sao'

const config: GeneratorConfig = {
  subGenerators: (
    [
      // @index('./generators/*', (pp, cc) => `['${pp.name}', '${pp.path}'],`)
      ['basic', './generators/basic'],
      ['generator', './generators/generator'],
      ['lib', './generators/lib'],
      ['mp', './generators/mp'],
      ['ssr', './generators/ssr'],
      ['web', './generators/web'],
      // @endindex
    ].map(
      ([name, generator]) => ({
        name,
        generator,
      }),
    )
  ),
}

export = config
