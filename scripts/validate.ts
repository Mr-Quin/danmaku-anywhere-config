import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'
import { glob } from 'glob'
import { integrationPolicySchema } from './schema'

const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const configsDir = path.resolve(dirname, '../configs')
const integrationDir = path.resolve(configsDir, 'integration')

const integrationPolicyFiles = await glob(`${integrationDir}/**/*.json`, {
  absolute: true,
})

const integrationValidation = await Promise.all(
  integrationPolicyFiles.map(async (file) => {
    const content = await fs.readFile(file, 'utf-8')
    return {
      file,
      validation: integrationPolicySchema.safeParse(JSON.parse(content)),
    }
  })
)

for (const result of integrationValidation) {
  if (!result.validation.success) {
    console.error('Validation failed for file:', result.file)
    console.error(result.validation.error)
  }
}

if (integrationValidation.some((result) => !result.validation.success)) {
  process.exit(1)
}
