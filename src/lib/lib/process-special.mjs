import { existsSync, readFileSync } from 'node:fs'
import * as fsPath from 'node:path'

import { formatTerminalText } from '@liquid-labs/terminal-text'
import { wrap } from '@liquid-labs/wrap-text'

import { installServer } from './install-server'
import { setupCLICompletion } from './setup-cli-completion'
import { setupCLIHome } from './setup-cli-home'
import { setupCLISettings } from './setup-cli-settings'

let versionCache

const processSpecial = async({ args, cliSettings }) => {
  const { cliName, localSettingsPath } = cliSettings
  if (args[0] === '-v' || args[0] === '--version') {
    const { getVersion } = cliSettings

    if (versionCache === undefined) {
      const packagePathProd = fsPath.resolve(__dirname, '..', 'package.json')
      const packagePathTest = fsPath.resolve(__dirname, '..', '..', '..', 'package.json')
      const packagePath = existsSync(packagePathProd) ? packagePathProd : packagePathTest

      const pkgJSON = JSON.parse(readFileSync(packagePath, { encoding : 'utf8' }))
      const { version } = pkgJSON

      versionCache = version
    }

    process.stdout.write(`${cliName} ${getVersion()}\nplugable-express-cli ${versionCache}\n`)
    return true
  }
  else if (args[0] !== 'setup' && existsSync(localSettingsPath) !== true) {
    console.error(formatTerminalText(wrap(`It does not look like ${cliName} has been setup (did not find settings file <code>${localSettingsPath}<rst>). Try:\n<em>${cliName} setup<rst>`, { ignoreTags : true })))
    process.exit(12)
  }
  else if (args[0] === 'setup') {
    if (await setupCLIHome({ cliSettings }) !== true) {
      console.log(wrap('\nBailing out. Review any messages above or submit a support request.'))
    }
    await setupCLISettings()
    installServer({ cliSettings })
    await setupCLICompletion()

    return true
  }
  else if (args[0] === 'start') {
    return true
  }

  return false
}

export { processSpecial }
