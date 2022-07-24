const { execSync } = require('child_process')

const platformMap = {
  darwin: 'macos',
  win32: 'windows',
  linux: 'linux',
}

function exec(args) {
  return execSync(
    `./dist/tailwindsort-${platformMap[process.platform]}-${process.arch} ${args}`
  ).toString()
}

it('works', () => {
  expect(exec('-f tests/fixtures/basic/index.html')).toContain('div')
})

it('supports first-party plugins', () => {
  let result = exec('--file tests/fixtures/plugins/index.html --config tests/fixtures/plugins/tailwind.config.js')

  expect(result).toEqual(
`<div class="potato uppercase line-clamp-1 sm:line-clamp-2"></div>
<div class="display orange aspect-w-1"></div>
<input type="text" class="strawberry form-input flex" />
<div class="grape line-clamp-2 sm:mt-2"></div>
<div class="prose block"></div>`)
})
