import * as fsPath from 'node:path'

import { processCommand } from './process-command'

const callEndpoint = async({ args, bundle, cliSettings }) => {
  const { fetchOpts, url } = await processCommand({ args, cliSettings })

  fetchOpts.headers['X-CWD'] = fsPath.resolve(process.cwd()) // TODO: walk down until we find 'package.json'

  return await fetch(url, fetchOpts)
}

export { callEndpoint }
