import { createContext } from 'tailwindcss/lib/lib/setupContextUtils.js'
import { resolveMatches, generateRules } from 'tailwindcss/lib/lib/generateRules.js'
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
    const err = new Error('Passed in file does not exist')
    err.code = 2
    throw err;
  }

  const contents = fs.readFileSync(filePath, 'utf-8')
  // readFileSync appends a '\n' 
  return contents.slice(0, -1)
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
    }).map(([className]) => className).join(" ")
    return match.replace(p2, ordered)
  })
  return sorted 
}

function printMap(map, tab="") { 
  for (const [k, v] of map.entries()) {
    // Don't print here yet...
    if (v instanceof Map) {
      console.log(`${tab}${k}:`); // Only print the key here...
      printMap(v, tab + "    "); // ...as recursion will take care of the value(s)
    } else {
      console.log(`${tab}${k} = ${v}`);
    }
  }
}

export async function format(contents, relativeConfigPath) {
  const customconfig = relativeConfigPath ? await loadCustomConfig(relativeConfigPath) : {}
  const twconfig = await resolveConfig(customconfig)
  const twcontext = await createContext(twconfig)
  let allVariants = []
  let allClasses = []
  let classIterator = twcontext.candidateRuleMap.keys()
  classIterator.next() 
  let currentClass = classIterator.next()
  while (!currentClass.done) {
    const baseClass = currentClass.value
    const beforeDeets = twcontext.candidateRuleMap.get(currentClass.value)

    const deets = beforeDeets[0][0]     
    let potentialClasses = [];
    if ("values" in deets.options) {
      const classValues = Object.keys(deets.options.values)
      const supportsNegative = deets.options.supportsNegativeValues
      
      potentialClasses = classValues.map(value => value === "DEFAULT" ? baseClass : `${baseClass}-${value}`)
      if (supportsNegative) {
        potentialClasses = potentialClasses.map(c => c.includes('auto') ? c : [`-${c}`, c]).flat()
      }
    } else {
      potentialClasses.push(baseClass)
    }
    allClasses.push(potentialClasses)
    allClasses = allClasses.flat()

    currentClass = classIterator.next()
  }


  twcontext.variantMap.forEach( (applyfunc, variant) => allVariants.push([variant, applyfunc[0][0]]))
  allVariants = allVariants.sort(([, a], [, z]) => {
      if (a === z) return 0
      if (a === null) return -1
      if (z === null) return 1
      return bigSign(a - z)
    }).map(([className, bigInt]) => `${className}: ${bigInt == null ? "null" : bigInt.toString()}`).join("\n")

  let orderedClasses = twcontext.getClassOrder(allClasses).sort(([, a], [, z]) => {
      if (a === z) return 0
      if (a === null) return -1
      if (z === null) return 1
      return bigSign(a - z)
    }).map(([className, bigInt]) => `${className}: ${bigInt == null ? "null" : bigInt.toString()}`).join("\n")

  fs.writeFileSync('out/classes.txt', orderedClasses)
  fs.writeFileSync('out/variants.txt', allVariants)
  const formatted = sortClasses(contents, twcontext)
  return formatted
}

