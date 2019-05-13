const withTypescript = require('@zeit/next-typescript')
const withCSS = require('@zeit/next-css')
const withLess = require('@zeit/next-less')
const withSass = require('@zeit/next-sass')
const withPlugins = require('next-compose-plugins')

module.exports = withPlugins([
  [withTypescript],
  [withCSS],
  [withLess, {
    cssModules: true,
  }],
  [withSass, {
    cssModules: true,
  }],
])
