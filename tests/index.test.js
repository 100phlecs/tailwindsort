import path from 'path'
import { format, getTailwindContext } from '../src/index.js'



test('non-tailwind classes', async () => {
  const relPath = path.join(__dirname, 'fixtures/basic/tailwind.config.js')
  expect(await format('<div class="sm:lowercase uppercase potato text-sm"></div>', relPath)).toEqual(
    '<div class="potato text-sm uppercase sm:lowercase"></div>'
  )
})


