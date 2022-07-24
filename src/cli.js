import { Command } from 'commander';
import { extractFile, format } from './index.js'

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

