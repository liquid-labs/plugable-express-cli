import { existsSync } from 'node:fs'

import { formatTerminalText } from '@liquid-labs/terminal-text'
import { wrap } from '@liquid-labs/wrap-text'

import { installServer } from './install-server'
import { setupCLICompletion } from './setup-cli-completion'
import { setupCLIHome } from './setup-cli-home'
import { setupCLISettings } from './setup-cli-settings'

const processSpecial = async({ args, cliSettings }) => {
  const { cliName, localSettingsPath } = cliSettings
  if (args[0] !== 'setup' && existsSync(localSettingsPath) !== true) {
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
