import * as readline from 'node:readline'

import * as shlex from 'shlex'

import { formatTerminalText } from '@liquid-labs/terminal-text'

import { processInput } from './lib/process-input'
import { processSpecial } from './lib/process-special'

const checkSettings = (cliSettings) => {
  for (const setting of ['cliName', 'localSettingsPath', 'port', 'serverPackage']) {
    if (cliSettings[setting] === undefined) {
      throw new Error(`CLI configuration '${setting}' is missing.`)
    }
  }

  if (cliSettings.executable === undefined) {
    cliSettings.executable = cliSettings.cliName
  }
  if (cliSettings.protocol === undefined) {
    cliSettings.protocol = 'http'
  }
  if (cliSettings.server === undefined) {
    cliSettings.server = '127.0.0.1'
  }
}

const startCLI = async(cliSettings) => {
  checkSettings(cliSettings)

  const args = process.argv.slice(2)

  if (args.length === 0) {
    process.stdout.write("Hit ctrl+C or enter '.' to exit.")

    while (true) {
      const rl = readline.createInterface({ input : process.stdin, output : process.stdout })

      try {
        rl.setPrompt(formatTerminalText(`\n<bold>${cliSettings.cliName}<rst>> `))
        rl.prompt()

        const it = rl[Symbol.asyncIterator]()
        const answer = (await it.next()).value.trim()

        if (answer === '.') {
          process.stdout.write('Goodbye.\n')
          process.exit(0)
        }

        const shellTokens = shlex.split(answer)

        await processInput({ args : shellTokens, cliSettings })
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
