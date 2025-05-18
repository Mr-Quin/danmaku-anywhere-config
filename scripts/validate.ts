import fs from 'node:fs/promises'
import { glob } from 'glob'
import { dirs } from './dirs'
import { CombinedPolicy, zCombinedPolicy } from './schema'

const { mountDir } = dirs

const configFiles = await glob(`${mountDir}/**/*.json`, {
  absolute: true,
})

const validationResults = await Promise.all(
  configFiles.map(async (file) => {
    const content = await fs.readFile(file, 'utf-8')
    return {
      file,
      validation: zCombinedPolicy.safeParse(JSON.parse(content)),
    }
  })
)

for (const result of validationResults) {
  if (!result.validation.success) {
    console.error('Validation failed for file:', result.file)
    console.error(result.validation.error)
  }
}

if (validationResults.some((result) => !result.validation.success)) {
  process.exit(1)
}

// at this point, all files are valid
const succeeded: CombinedPolicy[] = validationResults
  .map((result) => {
    if (result.validation.success) return result.validation.data
  })
  .filter((result) => result !== undefined)

const configIds = succeeded.map((result) => {
  return result.id
})

// check that all config IDs are unique
if (new Set(configIds).size !== configIds.length) {
  console.error('Config IDs are not unique')
  process.exit(1)
}

const integrationIds = succeeded
  .map((result) => {
    return result.integration?.id
  })
  .filter((id) => id !== undefined)

// check that all integration IDs are unique
if (new Set(integrationIds).size !== integrationIds.length) {
  console.error('Integration IDs are not unique')
  process.exit(1)
}
