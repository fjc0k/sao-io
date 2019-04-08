import { GeneratorConfig } from 'sao'

const config: GeneratorConfig = {
  subGenerators: (
    [
      // @index('./generators/*', (pp, cc) => `['${pp.name}', '${pp.path}'],`)
      ['basic', './generators/basic'],
      ['generator', './generators/generator'],
      ['mp', './generators/mp'],
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
