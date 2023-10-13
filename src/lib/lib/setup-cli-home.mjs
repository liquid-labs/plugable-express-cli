import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import { formatTerminalText } from '@liquid-labs/terminal-text'
import { wrap } from '@liquid-labs/wrap-text'

const setupCLIHome = async({ cliSettings }) => {
  const { additionalCLIHomeSetup, cliName, cliSettingsPath, terminal } = cliSettings

  if (existsSync(cliSettingsPath)) {
    console.log(formatTerminalText(wrap(`Found existing ${cliName} settings file: <code>${cliSettingsPath}<rst>`, { ignoreTags : true, ...terminal })))
  }
  else {
    const settingsDir = fsPath.dirname(cliSettingsPath)
    console.log(formatTerminalText(wrap(`Creating ${cliName} settings home: <code>${settingsDir}<rst>...`, { ignoreTags : true, ...terminal })))
    try {
      await fs.mkdir(settingsDir, { recursive : true })
      if (additionalCLIHomeSetup !== undefined) {
        const result = additionalCLIHomeSetup()
        if (result.then) {
          await result
        }
      }
    }
    catch (e) {
      console.log(`There was an error attempting initialize the ${cliName} home directory: ${e.message}`)
      return false
    }
  }

  return true
}

export { setupCLIHome }
