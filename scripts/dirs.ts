import path from 'node:path'
import url from 'node:url'

const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const rootDir = path.resolve(dirname, '../')
const outputDir = path.resolve(dirname, '../dist')
const configsDir = path.resolve(dirname, '../configs')
const mountDir = path.resolve(configsDir, 'mount')

export const dirs = {
  rootDir,
  outputDir,
  configsDir,
  mountDir,
}
