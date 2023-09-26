import * as fs from 'node:fs/promises'

import yaml from 'js-yaml'

import { Questioner } from '@liquid-labs/question-and-answer'
import { formatTerminalText, validStyles } from '@liquid-labs/terminal-text'

const settingsQuestions = {
  actions : [
    {
      prompt    : 'Which terminal highlighting scheme should be used?',
      options   : validStyles,
      parameter : 'TERMINAL_STYLE'
    },
    {
      statement : "80 or 120 would be typical limited column widths, or enter '0' to use the full terminal width."
    },
    {
      prompt    : 'Preferred column width?',
      paramType : 'int',
      parameter : 'TERMINAL_WIDTH'
    }
  ]
}

const setupCLISettings = async({ cliSettings }) => {
  const { localSettingsPath } = cliSettings

  let settings
  try {
    settings = yaml.load(localSettingsPath)
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      settings = {}
    }
    else {
      throw e
    }
  }

  const questioner = new Questioner({ initialParameters : settings, interrogationBundle : settingsQuestions })

  await questioner.question()
  const terminalStyle = questioner.get('TERMINAL_STYLE')
  const terminalWidth = questioner.get('TERMINAL_WIDTH')

  if (!('TERMINAL' in settings)) {
    settings.TERMINAL = {}
  }
  settings.TERMINAL.style = terminalStyle
  settings.TERMINAL.width = terminalWidth

  console.log(formatTerminalText(`Updating <code>${localSettingsPath}<rst>...`))
  const settingsYAML = yaml.dump(settings)
  // TODO: merge with existing; this is OK as long as we reset all vars here
  await fs.writeFile(settingsYAML, localSettingsPath)
}

export { setupCLISettings }
