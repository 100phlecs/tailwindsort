import { Command } from 'commander';
import { extractFile, format } from './index.js'

const program = new Command()

program
  .name('tailwindsort')
  .argument('<html>', 'html/html file to format')
  .option('--config <string>')
  .option('-f, --file', 'whether the input is a file')
  .action(async (html, options) => {
    if (options.file) 
      html = extractFile(html)
    const formatted = await format(html, options.config)
    console.log(formatted)  
  })
program.parse()

