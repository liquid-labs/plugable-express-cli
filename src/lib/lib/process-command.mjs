import * as fs from 'node:fs/promises'

const methods = ['DELETE', 'GET', 'OPTIONS', 'POST', 'PUT', 'UNBIND']

const extToMime = (value) => {
  switch (value) {
  case 'txt':
    return 'text/plain'
  case 'terminal':
    return 'text/terminal'
  case 'md':
  case 'markdown':
    return 'text/markdown'
  case 'csv':
    return 'text/csv'
  case 'tsv':
    return 'text/tab-separated-values'
  case 'pdf':
    return 'application/pdf'
  case 'docx':
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  default:
    return 'application/json'
  }
}

const processCommand = async({ args, cliSettings }) => {
  const { port, protocol, server } = cliSettings

  let method
  const pathBits = []
  const data = []
  let accept = 'text/terminal, text/plain;q=0.8, application/json;q=0.5'
  let setParams = false
  const { serverAPIPath } = cliSettings

  if (methods.includes(args[0]?.toUpperCase())) {
    method = args[0]
    args.shift()
  }

  for (const arg of args) {
    if (arg === '--' && setParams === false) {
      setParams = true
    }
    else if (setParams !== true) {
      // TODO: this is a workaround to allow space encoded names to retain their encoding; the problem is it's really
      // hard to get bash to respect spaces in completion options. I assume this will be alieviated when we move to zsh
      // and we can drop this.
      pathBits.push(encodeURIComponent(arg).replace(/%25([A-F0-9]{2})/i, '%$1'))
    }
    else { // setup params
      let [name, value = 'true', ...moreValue] = arg.split(/=/)
      // there may be '=' in the parameter value, so we re-build it
      value = [value, ...moreValue].join('=')
      if (name === 'format') {
        accept = extToMime(value)
        data.push([name, value]) // everything should work with our without this
      }
      else if (name !== 'sendFormParam') {
        data.push([name, value])
      }
    }
  }

  const path = '/' + pathBits.join('/')
  let api, endpointSpec
  if (serverAPIPath !== undefined) {
    try {
      api = JSON.parse(await fs.readFile(serverAPIPath))
      endpointSpec = api?.find((s) => path.match(new RegExp(s.matcher)))
    }
    catch (e) {
      if (e.code !== 'ENOENT') {
        throw e
      }
    }
  }

  if (method === undefined && endpointSpec === undefined && process.env.TEST_METHOD === undefined) {
    const msg = api === undefined
      ? 'No API spec found and no HTTP method specified.'
      : `No endpoint found in API for path: ${path}`
    throw new Error(msg)
  }
  method = method || endpointSpec?.method || process.env.TEST_METHOD

  const query = data.length > 0 && method !== 'POST' ? '?' + new URLSearchParams(data).toString() : ''
  const url = `${protocol}://${server}:${port}${path}${query}`

  const fetchOpts = {
    headers : {
      Accept : accept
    },
    method
  }

  if (method === 'POST') {
    fetchOpts.headers['Content-Type'] = 'application/json'

    const indexdData = data.reduce((acc, [n, v]) => {
      // if we got a bad path, then endpoint spec won't be defined; but we want the server to handle it, so we move on
      const paramSpec = endpointSpec?.parameters.find((p) => p.name === n)
      if (paramSpec?.isMultivalue === true) {
        const currArray = acc[n] || []
        currArray.push(v)
        acc[n] = currArray
      }
      else {
        acc[n] = v
      }

      return acc
    }, {})

    fetchOpts.body = JSON.stringify(indexdData)
  }

  return { // 'data', 'method', and 'path' are not currently consumed in the progarm, but are useful for testing
    data,
    fetchOpts,
    method,
    path,
    url
  }
}

export { processCommand }
