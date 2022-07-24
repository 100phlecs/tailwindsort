import { createContext } from 'tailwindcss/lib/lib/setupContextUtils.js'
import resolveConfig from 'tailwindcss/resolveConfig.js'
import requireFresh from 'import-fresh'
import fs from 'fs'
import path from 'path'


export async function format(contents, opts) {
  const configPath = path.resolve(process.cwd(), 'tests/fixtures/basic/tailwind.config.js'); 
  if (!fs.existsSync(configPath)) {
    console.err("config file does not exist");
    return;
  }

  console.log("configpath", configPath)
  let tailwindconfig = await requireFresh(configPath)
  let context = createContext(resolveConfig(tailwindconfig))
  console.log(context);
}


function getConfigPath() {
  const baseDir = process.cwd()

}

format("test");
