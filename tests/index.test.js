import path from 'path'
import fs from 'fs'
import { format, getTailwindContext, extractFile } from '../src/index.js'


function grabFixtureConfig(fixture) {
  return path.join(__dirname, `fixtures/${fixture}/tailwind.config.js`)
}

function grabFixtureFileContents(fixture) {
  const contents = fs.readFileSync(path.join(__dirname, `fixtures/${fixture}/index.html`), 'utf-8')
  return contents.slice(0, -1)
}

it('works without config', async () => {
  expect(await format('<div class="sm:lowercase uppercase potato text-sm"></div>', null)).toEqual(
    '<div class="potato text-sm uppercase sm:lowercase"></div>'
  )
})

it('sorts non-tailwind classes to front', async () => {
  const relPath = grabFixtureConfig('basic') 
  expect(await format('<div class="sm:lowercase uppercase potato text-sm"></div>', relPath)).toEqual(
    '<div class="potato text-sm uppercase sm:lowercase"></div>'
  )
})

it('sorts custom defined attributes', async () => {
  const relPath = grabFixtureConfig('basic')
  const file = grabFixtureFileContents('basic')

  expect(await format('<div class="sm:bg-tomato bg-red-500"></div>', relPath)).toEqual(
    '<div class="bg-red-500 sm:bg-tomato"></div>'
  )
  expect(await format(file, null)).toEqual(
    '<div class="sm:bg-tomato bg-red-500"></div>'
  )
})

it('sorts plugin attributes', async () => {
  const relPath = grabFixtureConfig('plugins')
  const file = grabFixtureFileContents('plugins')


  expect(await format(file, relPath)).toEqual(
`<div class="potato uppercase line-clamp-1 sm:line-clamp-2"></div>
<div class="display orange aspect-w-1"></div>
<input type="text" class="strawberry form-input flex" />
<div class="grape line-clamp-2 sm:mt-2"></div>
<div class="prose block"></div>`)

})

