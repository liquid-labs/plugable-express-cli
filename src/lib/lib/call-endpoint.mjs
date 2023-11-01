import * as fsPath from 'node:path'

import { processCommand } from './process-command'
import { startServer } from './start-server'

const callEndpoint = async({ args, bundle, cliSettings }) => {
  const { fetchOpts, rootURL, url } = await processCommand({ args, cliSettings })

  fetchOpts.headers['X-CWD'] = fsPath.resolve(process.cwd()) // TODO: walk down until we find 'package.json'

  try {
    return await fetch(url, fetchOpts)
  }
  catch (e) {
    console.log('error...', e.code) // DEBUG
    if (e.code === 'ECONNREFUSED' || e.cause?.code === 'ECONNREFUSED') {
      console.log('ECONNREFUSED...') // DEBUG
      await startServer({ cliSettings, rootURL })
      return await callEndpoint({ args, bundle, cliSettings })
    }
    else {
      console.log('throwing...') // DEBUG
      throw (e)
    }
  }
}

export { callEndpoint }
