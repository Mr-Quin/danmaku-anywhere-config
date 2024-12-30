import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'
import { glob } from 'glob'
import { IntegrationPolicy, integrationPolicySchema } from './schema'

// Read all config files and merge them into one json file, then upload it to the server
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const outputDir = path.resolve(dirname, '../dist')
const configsDir = path.resolve(dirname, '../configs')
const integrationDir = path.resolve(configsDir, 'integration')

const integrationPolicyFiles = await glob(`${integrationDir}/**/*.json`, { absolute: true })

const integrationPolicyConfig: IntegrationPolicy[] = []

for (const file of integrationPolicyFiles) {
  // Parse the file and validate it against the schema
  const content = await fs.readFile(file, 'utf-8')
  const data = integrationPolicySchema.parse(JSON.parse(content))
  integrationPolicyConfig.push(data)
}

// Build merged config
const config = {
  time: new Date().getTime(),
  configs: {
    integration: integrationPolicyConfig.toSorted((a, b) => a.name.localeCompare(b.name)),
  },
}

// Write the merged config to the output directory, creating it if it doesn't exist
console.log(JSON.stringify(config, null, 2))

await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(path.resolve(outputDir, 'config.json'), JSON.stringify(config, null, 2))

console.log('Merged config written to', path.resolve(outputDir, 'config.json'))

