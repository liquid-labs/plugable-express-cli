import { existsSync } from 'node:fs'

import { install } from '@liquid-labs/npm-toolkit'
import { formatTerminalText } from '@liquid-labs/terminal-text'
import { tryExec } from '@liquid-labs/shell-toolkit'
import { wrap } from '@liquid-labs/wrap-text'

const installServer = async({ cliSettings }) => {
  const { cliName, executable, localServerDevPaths: testPaths = [], serverPackage, terminal } = cliSettings
  const results = tryExec(`which ${executable}`, { noThrow : true })
  if (results.code === 0) {
    process.stdout.write(formatTerminalText(wrap(`Found existing <code>${cliName}<rst> install.`, { ignoreTags : true, ...terminal })) + '\n')
  }
  else {
    process.stdout.write(formatTerminalText(wrap(`Installing <code>${serverPackage}<rst>...`, { ignoreTags : true, ...terminal })) + '\n')
    process.stdout.write(wrap('Checking for local installation...', { ...terminal }) + '\n')

    let localPath
    for (const testPath of testPaths) {
      if (existsSync(testPath)) {
        localPath = testPath
      }
    }
    if (localPath !== undefined) {
      process.stdout.write(`Installing from local path: ${localPath}\n`)
      await install({ global : true, packages : [localPath], verbose : true })
    }
    else {
      const { serverVersion } = cliSettings
      process.stdout.write(`Installing published package: ${serverPackage}@${serverVersion}\n`)
      await install({ global : true, packages : [serverPackage], verbose : true, version : serverVersion })
    }
  }
}

export { installServer }
