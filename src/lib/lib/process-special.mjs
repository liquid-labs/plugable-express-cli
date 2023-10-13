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
  const { cliName, cliSettingsPath, terminal } = cliSettings
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
  else if (args[0] !== 'setup-server' && existsSync(cliSettingsPath) !== true) {
    console.error(formatTerminalText(wrap(`It does not look like ${cliName} has been setup (did not find settings file <code>${cliSettingsPath}<rst>). Try:\n<em>${cliName} setup<rst>`, { ignoreTags : true, ...terminal })))
    process.exit(12)
  }
  else if (args[0] === 'setup-server') {
    if (await setupCLIHome({ cliSettings }) !== true) {
      console.log(wrap('\nBailing out. Review any messages above or submit a support request.', { ...terminal }))
    }
    await setupCLISettings({ cliSettings })
    installServer({ cliSettings })
    await setupCLICompletion({ cliSettings })

    return true
  }

  return false
}

export { processSpecial }
