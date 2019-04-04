module.exports = {
  subGenerators: (
    [
      // @index('./generators/*', (pp, cc) => `['${pp.name}', '${pp.path}'],`)
      ['h5', './generators/h5'],
      ['weapp', './generators/weapp'],
      // @endindex
    ].map(
      ([name, generator]) => ({
        name,
        generator,
      }),
    )
  ),
}
