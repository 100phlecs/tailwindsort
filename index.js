import { createContext } from 'tailwindcss/lib/lib/setupContextUtils.js'
import resolveConfig from 'tailwindcss/resolveConfig.js'
import requireFresh from 'import-fresh'
import fs from 'fs'
import path from 'path'

const classRegex = /\b(?:class(?:Name)*\s*(=|:)\s*["'])([_a-zA\.-Z0-9\s\-:\[\]]+)["']/ig

function bigSign(bigIntValue) {
  return (bigIntValue > 0n) - (bigIntValue < 0n)
}

export async function getTailwindContext(configFilePath) {
  const configPath = path.resolve(process.cwd(), configFilePath); 
  console.log(configPath)

  if (!fs.existsSync(configPath)) {
    console.err("config file does not exist");
    return;
  }

  const tailwindconfig = await requireFresh(configPath)
  const twcontext = await createContext(resolveConfig(tailwindconfig))
  return twcontext
}

export function format(contents, twcontext) {

  const formatted = contents.replaceAll(classRegex, (match, p1, p2) => {
    const ordered = twcontext.getClassOrder(p2.split(" ")).sort(([, a], [, z]) => {
      if (a === z) return 0
      if (a === null) return -1
      if (z === null) return 1
      return bigSign(a - z)
    }).map(([className]) => className).flat().join(" ")
    return match.replace(p2, ordered)
  })    
  return formatted
}


