import { existsSync } from 'node:fs'

import { install } from '@liquid-labs/npm-toolkit'
import { formatTerminalText } from '@liquid-labs/terminal-text'
import { tryExec } from '@liquid-labs/shell-toolkit'
import { wrap } from '@liquid-labs/wrap-text'

const installServer = async({ cliSettings }) => {
  const { cliName, executable, localServerDevPaths: testPaths = [], serverPackage, terminal } = cliSettings

  const result = tryExec(`npm ls -g ${serverPackage}`, { noThrow : true })
  if (result.code === 0) { // then nothing to do
    process.stdout.write(formatTerminalText(wrap(`<code>${serverPackage}<rst> <em>already installed<rst>`, { ignoreTags : true, ...terminal })) + '\n')
    return
  }
  else if (result.code > 1) {
    throw new Error(`Error trying to determine whether '${serverPackage}' (${result.code}): ${result.stderr}`)
  }

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

export { installServer }
