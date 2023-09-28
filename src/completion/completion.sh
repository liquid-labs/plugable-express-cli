#!/usr/bin/env bash

_{{ .CLI_NAME }}() {
  local PROJECT ORG NEXT_CONTEXT
  PROJECT=$(basename "$PWD")
  ORG=$(basename "$(dirname "$PWD")")

  COMPREPLY=( $({{ .CLI_NAME }} server next-commands -- command="${COMP_LINE}") )
  # for this to work, /must/ load pattern into var like this
  PATTERN='^[ ]*catalyst[ ]*([^ ]*)$'
  if [[ ${COMP_LINE} =~ $PATTERN ]]; then
    NEXT_TOKEN=${BASH_REMATCH[1]}
    if [[ setup-server ==  ${NEXT_TOKEN}* ]]; then
      COMPREPLY+=( 'setup-server' )
    fi
    if [[ --version ==  ${NEXT_TOKEN}* ]]; then
      COMPREPLY+=( '--version' )
    fi
  fi
}

# Use default file/dir/command/alias/etc. completions when COMPREPLY is empty
complete -o bashdefault -o default -F _{{ .CLI_NAME }} {{ .CLI_NAME }}
