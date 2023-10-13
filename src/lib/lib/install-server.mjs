import { existsSync } from 'node:fs'

import { install } from '@liquid-labs/npm-toolkit'
import { formatTerminalText } from '@liquid-labs/terminal-text'
import { tryExec } from '@liquid-labs/shell-toolkit'
import { wrap } from '@liquid-labs/wrap-text'

const installServer = ({ cliSettings }) => {
  const { cliName, executable, localServerDevPaths: testPaths = [], serverPackage, terminal } = cliSettings
  const results = tryExec(`which ${executable}`, { noThrow : true })
  if (results.code === 0) {
    console.log(formatTerminalText(wrap(`Found existing <code>${cliName}<rst> install.`, { ignoreTags : true, ...terminal })))
  }
  else {
    console.log(formatTerminalText(wrap(`Installing <code>${serverPackage}<rst>...`, { ignoreTags : true, ...terminal })))
    console.log(wrap('Checking for local installation...', { ...terminal }))

    let localPath
    for (const testPath of testPaths) {
      if (existsSync(testPath)) {
        localPath = testPath
      }
    }
    if (localPath !== undefined) {
      install({ global : true, pkgs : [localPath], verbose : true })
    }
    else {
      const { serverVersion } = cliSettings
      install({ global : true, pkgs : [serverPackage], verbose : true, version : serverVersion })
    }
  }
}

export { installServer }
