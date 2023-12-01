import shlex from 'shlex'

import { formatTerminalText } from '@liquid-labs/terminal-text'
import { Questioner } from '@liquid-labs/question-and-answer'

import { callEndpoint } from './call-endpoint'

const addArg = ({ args, parameter, paramType, value }) => {
  if (!args.includes('--')) { args.push('--') }
  if (paramType?.match(/bool(?:ean)?/i) && value) {
    if (value === true) { // We want this inside because we don't want to run outer if/else if we're bool
      args.push(parameter)
    }
  }
  else {
    args.push(parameter + '=' + value)
  }
}

const processQnA = async({ args, cliSettings, response }) => {
  const returnCommand = response.headers.get('X-Answer-Return-Command')
  if (returnCommand !== undefined) {
    args = shlex.split(returnCommand)
  }
  // the incoming response is from the previous call, which has indicated a QnA request
  const qnaBundles = await response.json()
  const answerBundles = []
  let sendBundle = false
  for (const interrogationBundle of qnaBundles) {
    const questioner = new Questioner({ interrogationBundle, initialParameters : interrogationBundle.env })
    const { title, key } = interrogationBundle

    if (title !== undefined) {
      process.stdout.write(formatTerminalText(`<h1>${title}<rst>\n\n`))
    }

    await questioner.question()
    const results = questioner.results

    const bundleResults = []
    const bundle = { results : bundleResults }
    if (key !== undefined) bundle.key = key // we do this to save the characters of sending an undefined key

    results.reduce((acc, r) => {
      const { handling, parameter, paramType, value } = r
      if (handling === 'parameter') {
        addArg({ args, parameter, paramType, value })
      }
      else if (handling === 'keyedParameter') { // TODO: this isn't supported in the stack yet, but makes sense
        addArg({ args, parameter : `${key}:${parameter}`, paramType, value })
      }
      else if (handling === undefined || handling === 'bundle') {
        acc.push(r)
        sendBundle = true
      }
      return acc
    }, bundleResults)

    answerBundles.push(bundle) // best practice is to send a key and access result values using the key, but we
    // always push a result bundle for each question bundle to facilicate position-based processing
  }

  // if the answer bundle is truly empty, then we don't send it as the receiver probably doesn't support 'answers'
  // parameter
  if (sendBundle === true) {
    addArg({ args, parameter : 'answers', paramType : 'string', value : JSON.stringify(answerBundles) })
  }

  process.stdout.write('\nRe-sending request with answers...\n')
  response = await callEndpoint({ args, cliSettings })

  return response
}

export { processQnA }
