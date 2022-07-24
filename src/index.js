import { createContext } from 'tailwindcss/lib/lib/setupContextUtils.js'
import resolveConfig from 'tailwindcss/resolveConfig.js'
import requireFresh from 'import-fresh'
import fs from 'fs'
import path from 'path'

const classRegex = /\b(?:class(?:Name)*\s*(=|:)\s*["'])([_a-zA\.-Z0-9\s\-:\[\]]+)["']/ig

function bigSign(bigIntValue) {
  return (bigIntValue > 0n) - (bigIntValue < 0n)
}


export function extractFile(relativeFilePath) {
  const filePath = path.resolve(process.cwd(), relativeFilePath)

  if (!fs.existsSync(filePath)) {
    console.err("html file does not exist");
    return;
  }

  const contents = fs.readFileSync(filePath).toString('utf-8')
  return contents;
}



export async function loadCustomConfig(relativeConfigPath) {
  const configPath = path.resolve(process.cwd(), relativeConfigPath); 

  if (!fs.existsSync(configPath)) {
    const err = new Error('Config file does not exist')
    err.code = 2 
    throw err
  }

  const tailwindconfig = await requireFresh(configPath)
  return tailwindconfig 
}



function sortClasses(contents, twcontext) {
  const sorted = contents.replaceAll(classRegex, (match, p1, p2) => {
    let ordered = twcontext.getClassOrder(p2.split(" ")).sort(([, a], [, z]) => {
      if (a === z) return 0
      if (a === null) return -1
      if (z === null) return 1
      return bigSign(a - z)
    }).map(([className]) => className).flat().join(" ")
    return match.replace(p2, ordered)
  })    
  return sorted 
}

export async function format(contents, relativeConfigPath) {
  const customconfig = relativeConfigPath ? await loadCustomConfig(relativeConfigPath) : {}
  const twconfig = await resolveConfig(customconfig)
  const twcontext = await createContext(twconfig)
  const formatted = sortClasses(contents, twcontext)
  return formatted 
}


