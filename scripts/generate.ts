import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'
import { glob } from 'glob'
import { IntegrationPolicy, integrationPolicySchema } from './schema'
import crypto from 'node:crypto'

type ConfigIntegrationPolicy = IntegrationPolicy & {
  file: string
  hash: string
}

// Read all config files and merge them into one json file, then upload it to the server
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const rootDir = path.resolve(dirname, '../')
const outputDir = path.resolve(dirname, '../dist')
const configsDir = path.resolve(dirname, '../configs')
const integrationDir = path.resolve(configsDir, 'integration')

const getHash = (content: string) => {
  return crypto.createHash('sha1').update(content).digest('hex')
}

const getGlobFiles = async (pattern: string) => {
  const files = await glob(pattern, { cwd: rootDir, absolute: true })
  // Replace backslashes with forward slashes in case some lunatic uses Windows (me)
  return files.map((file) => path.relative(rootDir, file).replace(/\\/g, '/'))
}

const integrationPolicyFiles = await getGlobFiles(`${integrationDir}/**/*.json`)

const integrationPolicyConfig: ConfigIntegrationPolicy[] = []

for (const file of integrationPolicyFiles) {
  console.log('Processing file:', file)
  // Parse the file and validate it against the schema
  const content = await fs.readFile(file, 'utf-8')
  const data = integrationPolicySchema.parse(JSON.parse(content))
  const hash = getHash(content)

  integrationPolicyConfig.push({
    ...data,
    file,
    hash,
  })
}

// Build merged config
const config = {
  time: new Date().getTime(),
  configs: {
    integration: integrationPolicyConfig.sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
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
