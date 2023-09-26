#!/usr/bin/env bash

_{{ .CLI_NAME }}() {
  local PROJECT ORG NEXT_CONTEXT
  PROJECT=$(basename "$PWD")
  ORG=$(basename "$(dirname "$PWD")")

  COMPREPLY=( $({{ .CLI_NAME }} server next-commands -- command="${COMP_LINE}") )
  if [[ ${COMP_LINE} =~ '^ *{{ .CLI_NAME }} *$' ]]; then
    COMPREPLY+=( 'setup' 'update' )
  fi
}

# Use default file/dir/command/alias/etc. completions when COMPREPLY is empty
complete -o bashdefault -o default -F _{{ .CLI_NAME }} {{ .CLI_NAME }}
