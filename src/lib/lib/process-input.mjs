import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import yaml from 'js-yaml'

import { formatTerminalText } from '@liquid-labs/terminal-text'
import { wrap } from '@liquid-labs/wrap-text'

import { callEndpoint } from './call-endpoint'
import { processQnA } from './process-qna'

const processInput = async({ args, cliSettings }) => {
  let settings
  try {
    settings = yaml.load(cliSettings.cliSettingsPath)
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      settings = {}
    }
    else {
      throw e
    }
  }

  let response = await callEndpoint({ args, cliSettings })

  const isQnA = !!response.headers.get('X-Question-and-Answer')

  if (isQnA) {
    response = await processQnA({ args, cliSettings, response })
  }

  const contentType = response.headers.get('Content-Type')
  const disposition = response.headers.get('Content-Disposition')
  // const status = response.status

  if (disposition?.startsWith('attachment')) { // save the file
    let outputFileName = 'output'
    const [, fileNameBit] = disposition.split(/;\s*/)
    if (fileNameBit.startsWith('filename=')) {
      const [, rawFileName] = fileNameBit.split(/=\s*/)
      outputFileName = fsPath.basename(rawFileName.replace(/^['"]/, '').replace(/['"]$/, ''))
    }

    await fs.writeFile(outputFileName, (await response.blob()).stream())
    console.log(`Saved '${contentType}' file '${outputFileName}'.`)
  }
  else { // output to screen
    /* if (status >= 400) { // TODO: make optional?
      const errorSource = status < 500 ? 'Client' : 'Server'
      console.error(formatTerminalText(`<error>${errorSource} error ${status}: ${response.statusText}<rst>`))
    } */
    if (contentType.startsWith('application/json')) {
      console.log(JSON.stringify(await response.json(), null, '  '))
    }
    else {
      const terminalOpts = settings?.TERMINAL || {}
      const text = await response.text()
      const wrappedText = wrap(text, { ignoreTags : true, smartIndent : true })
      console.log(formatTerminalText(wrappedText, terminalOpts))
    }
  }
}

export { processInput }
