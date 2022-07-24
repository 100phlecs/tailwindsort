import path from 'path'
import { format, getTailwindContext } from '../index.js'



test('non-tailwind classes', async () => {
  const twcontext = await getTailwindContext(path.join(__dirname, 'fixtures/basic/tailwind.config.js'))
  expect(format('<div class="sm:lowercase uppercase potato text-sm"></div>', twcontext)).toEqual(
    '<div class="potato text-sm uppercase sm:lowercase"></div>'
  )
})


