import { Command } from 'commander';
import { extractFile, format } from './index.js'
let Module = require('module')
let origRequire = Module.prototype.require

let localModules = {
  'tailwindcss/colors': require('tailwindcss/colors'),
  'tailwindcss/defaultConfig': require('tailwindcss/defaultConfig'),
  'tailwindcss/defaultTheme': require('tailwindcss/defaultTheme'),
  'tailwindcss/resolveConfig': require('tailwindcss/resolveConfig'),
  'tailwindcss/plugin': require('tailwindcss/plugin'),

  '@tailwindcss/aspect-ratio': require('@tailwindcss/aspect-ratio'),
  '@tailwindcss/forms': require('@tailwindcss/forms'),
  '@tailwindcss/line-clamp': require('@tailwindcss/line-clamp'),
  '@tailwindcss/typography': require('@tailwindcss/typography'),

  // These are present to allow them to be specified in the PostCSS config file
  autoprefixer: require('autoprefixer'),
  tailwindcss: require('tailwindcss'),
}

Module.prototype.require = function (id) {
  if (localModules.hasOwnProperty(id)) {
    return localModules[id]
  }
  return origRequire.apply(this, arguments)
}

const program = new Command()

program
  .name('tailwindsort')
  .argument('<html>', 'html/html file to format')
  .option('-c, --config <string>', 'relative path to tailwind config')
  .option('-f, --file', 'whether the input is a file')
  .action(async (html, options) => {
    if (options.file) 
      html = extractFile(html)
    try {
    const formatted = await format(html, options.config)
    process.stdout.write(formatted)
    } catch (error) {
      program.error(error.message, { exitCode: error.code })
    }
  })
program.parse()

