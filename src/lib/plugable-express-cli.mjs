import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'
import * as readline from 'node:readline'

import * as shlex from 'shlex'
import * as yaml from 'js-yaml'

import { formatTerminalText } from '@liquid-labs/terminal-text'

import { processInput } from './lib/process-input'
import { processSpecial } from './lib/process-special'

const checkSettings = (cliSettings) => {
  for (const setting of ['cliName', 'port', 'serverPackage']) {
    if (cliSettings[setting] === undefined) {
      throw new Error(`CLI configuration '${setting}' is missing.`)
    }
  }

  if (cliSettings.cliSettingsPath === undefined) {
    const configHome = process.env.XDG_CONFIG_HOME || fsPath.join(process.env.HOME, '.config')
    const cliSettingsPath = fsPath.join(configHome, 'plugable-express-cli', 'cli-settings.yaml')
    cliSettings.cliSettingsPath = cliSettingsPath
  }
  if (cliSettings.protocol === undefined) {
    cliSettings.protocol = 'http'
  }
  if (cliSettings.server === undefined) {
    cliSettings.server = '127.0.0.1'
  }
}

const loadCLIConfig = async (cliSettings) => {
  const { cliSettingsPath } = cliSettings

  let width = 80 // the default
  try {
    const cliConfigPath = cliSettings.cliSettingsPath
    const cliConfigContents = await fs.readFile(cliConfigPath, { encoding: 'utf8' })
    const cliConfig = yaml.load(cliConfigContents)
    const configWidth = cliConfig.TERMINAL?.width

    if (configWidth !== undefined) {
      const maxWidth = process.stdout.columns
      if (maxWidth !== undefined) {
        width = configWidth < maxWidth ? configWidth : 0
      }
      else {
        width = configWidth
      }
    }
  }
  catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }
  }

  cliSettings.terminal = { width }
}

const startCLI = async(cliSettings) => {
  checkSettings(cliSettings)
  await loadCLIConfig(cliSettings)

  const args = process.argv.slice(2)

  if (args.length === 0) {
    process.stdout.write("Hit ctrl+C or enter '.' to exit.\n")

    while (true) {
      const rl = readline.createInterface({ input : process.stdin, output : process.stdout })

      try {
        rl.setPrompt(formatTerminalText(`\n<bold>${cliSettings.cliName}<rst>> `))
        rl.prompt()

        const it = rl[Symbol.asyncIterator]()
        const answer = (await it.next()).value?.trim()

        if (answer === '.' || answer === undefined /* when user hits ctrl+C */) {
          if (answer === undefined) process.stdout.write('\n')
          process.stdout.write('Goodbye.\n')
          process.exit(0)
        }

        const shellTokens = shlex.split(answer)

        try {
          await processInput({ args : shellTokens, cliSettings })
        }
        catch (e) {
          process.stdout.write(e.message + '\n')
        }
      }
      finally { rl.close() }
    }
  }
  else {
    if (await processSpecial({ args, cliSettings }) === false) {
      processInput({ args, cliSettings })
    }
  }
}

export { startCLI }
