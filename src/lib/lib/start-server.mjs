import { spawn } from 'node:child_process'

import { formatTerminalText } from '@liquid-labs/terminal-text'
import { wrap } from '@liquid-labs/wrap-text'

const startServer = async({ cliSettings, rootURL }) => {
  const { serverExec, terminal } = cliSettings

  process.stdout.write(formatTerminalText(
    wrap('Server not running; <em>attempting to start server<rst>...\n', {
      ignoreTags : true,
      ...terminal
    })
  ))

  const subprocess = spawn(serverExec, { detached : true, stdio : ['ignore', 'inherit', 'inherit'] })
  subprocess.unref()

  let running = false
  process.stdout.write('Retrying')
  for (let i = 0; running === false && i < 40; i += 1) {
    process.stdout.write('.')
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      await fetch(`${rootURL}/server/version`)
      running = true
    }
    catch (e) {}
  }
  if (running === true) {
    process.stdout.write(formatTerminalText(
      formatTerminalText(wrap('\nServer <em>started<rst>.\n', { ignoreTags : true, ...terminal }))
    ))
  }
  else {
    process.stdout.write(formatTerminalText(
      formatTerminalText(wrap('\nServer <error>failed to start<rst>.\n', { ignoreTags : true, ...terminal }))
    ))
    process.exit(2)
  }
}

export { startServer }
