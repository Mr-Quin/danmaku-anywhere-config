import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'
import { dirs } from './dirs'
import { CombinedPolicy, zCombinedPolicy } from './schema'

type CombinedPolicyConfig = {
  config: CombinedPolicy
  file: string
  hash: string
}

const getHash = (content: string) => {
  return crypto.createHash('sha1').update(content).digest('hex')
}

const { rootDir, mountDir, outputDir, configsDir } = dirs

const getGlobFiles = async (pattern: string) => {
  const files = await glob(pattern, { cwd: rootDir, absolute: true })
  // Replace backslashes with forward slashes in case some lunatic uses Windows (me)
  return files.map((file) => path.relative(rootDir, file).replace(/\\/g, '/'))
}

// clear the output directory
await fs.rm(outputDir, { recursive: true, force: true })

const configFiles = await getGlobFiles(`${mountDir}/**/*.json`)

const configs: CombinedPolicyConfig[] = []

for (const file of configFiles) {
  console.log('Processing file:', file)
  // Parse the file and validate it against the schema
  const content = await fs.readFile(file, 'utf-8')
  const data = zCombinedPolicy.parse(JSON.parse(content))
  const hash = getHash(content)

  configs.push({
    config: data,
    file,
    hash,
  })
}

// Build merged config
const config = {
  time: new Date().getTime(),
  configs: {
    mount: configs.sort((a, b) => a.config.name.localeCompare(b.config.name)),
  },
}

// Write the merged config to the output directory, creating it if it doesn't exist
await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(
  path.resolve(outputDir, 'config.json'),
  JSON.stringify(config, null, 2)
)
console.log('Merged config written to', path.resolve(outputDir, 'config.json'))

// Copy the configs to the output directory
// Create configs directory if it doesn't exist
const outputConfigDir = path.resolve(outputDir, 'configs')
await fs.mkdir(outputConfigDir, { recursive: true })
await fs.cp(configsDir, outputConfigDir, { recursive: true })
console.log('Configs copied to', outputDir)
