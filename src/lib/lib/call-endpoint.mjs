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
    if (e.code === 'ECONNREFUSED' || e.cause?.code === 'ECONNREFUSED') {
      await startServer({ cliSettings, rootURL })
      return await callEndpoint({ args, bundle, cliSettings })
    }
    else {
      throw (e)
    }
  }
}

export { callEndpoint }
