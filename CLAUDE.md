# Plugable Express CLI - Project Reference

## Overview

`@liquid-labs/plugable-express-cli` is a framework for building command-line interfaces that communicate with compliant Express servers. The CLI discovers server endpoints, provides integrated help and tab completion, and invokes endpoints through the CLI.

## Architecture

### Core Components

1. **CLI Framework** (`plugable-express-cli`)
   - Provides the base CLI infrastructure
   - Handles server communication and endpoint discovery
   - Manages CLI settings, completion, and interactive mode
   - Auto-starts server if not running

2. **Client Implementation** (e.g., `sdlcpilot-cli`)
   - Configures the CLI with specific settings
   - Defines server package, port, and other parameters
   - Acts as a thin wrapper around the framework

3. **Server** (e.g., `comply-server`)
   - Express-based server providing REST endpoints
   - Exposes API specification for endpoint discovery
   - Handles actual business logic

### How It Works

1. **Initialization**: Client CLI (like `sdlcpilot-cli`) configures settings and calls `startCLI()`
2. **Endpoint Discovery**: CLI reads server API specification to understand available endpoints
3. **Command Processing**: CLI converts command-line arguments to HTTP requests
4. **Server Communication**: CLI sends requests to server, auto-starting it if needed
5. **Response Handling**: CLI formats and displays server responses

## Project Structure

```
plugable-express-cli/
├── src/
│   ├── lib/
│   │   ├── plugable-express-cli.mjs    # Main entry point
│   │   └── lib/
│   │       ├── call-endpoint.mjs       # Handles HTTP calls to server
│   │       ├── process-command.mjs     # Parses CLI args into HTTP requests
│   │       ├── process-input.mjs       # Processes user input and responses
│   │       ├── process-special.mjs     # Handles special commands (--setup, --version)
│   │       ├── start-server.mjs        # Auto-starts server when needed
│   │       ├── setup-cli-completion.mjs # Sets up bash/zsh tab completion
│   │       ├── setup-cli-settings.mjs  # Manages CLI configuration
│   │       └── process-qna.mjs         # Handles interactive Q&A flows
│   └── completion/
│       └── completion.sh                # Bash completion script template
└── package.json
```

## Key Files

### `/src/lib/plugable-express-cli.mjs`
Main entry point that:
- Validates CLI settings
- Loads CLI configuration
- Handles interactive and non-interactive modes
- Processes user input through readline interface

### `/src/lib/lib/process-command.mjs`
Converts CLI arguments to HTTP requests:
- Extracts HTTP method from args (GET, POST, etc.)
- Builds URL path from arguments
- Handles parameters after `--` separator
- Supports format parameter for content negotiation
- Recently added YAML format support

### `/src/lib/lib/call-endpoint.mjs`
Makes HTTP calls to server:
- Adds current working directory header
- Auto-starts server on connection refused
- Returns fetch response for processing

### `/src/lib/lib/start-server.mjs`
Manages server lifecycle:
- Spawns server process in detached mode
- Polls for server availability
- Provides user feedback during startup

## Usage Example: sdlcpilot-cli

`sdlcpilot-cli` demonstrates how to use the framework:

```javascript
import { startCLI } from '@liquid-labs/plugable-express-cli'

const cliSettings = {
  cliName: 'sdlc',                    // CLI command name
  getVersion: () => version,          // Version function
  port: COMPLY_PORT(),                // Server port
  serverAPIPath: COMPLY_API_SPEC_PATH(), // API spec location
  serverExec: COMPLY_SERVER_CLI_NAME(), // Server executable
  serverHome: COMPLY_HOME(),          // Server home directory
  serverPackage: COMPLY_SERVER_CLI_NAME(), // NPM package name
  // Optional settings:
  protocol: 'http',                   // Default protocol
  server: '127.0.0.1',                // Default server host
  defaultRegistries: [...],           // NPM registries
  localServerDevPaths: [...]          // Local dev paths
}

await startCLI(cliSettings)
```

## CLI Settings Configuration

Required settings:
- `cliName`: Command name for the CLI
- `port`: Server port number
- `serverPackage`: NPM package name for the server

Optional settings:
- `protocol`: HTTP protocol (default: 'http')
- `server`: Server host (default: '127.0.0.1')
- `serverAPIPath`: Path to API specification file
- `serverExec`: Server executable command
- `serverHome`: Server home directory
- `getVersion`: Function returning CLI version
- `defaultRegistries`: NPM registries for server installation
- `localServerDevPaths`: Local development paths for server

## Command Processing Flow

1. **Arguments Parsing**:
   - Extract HTTP method if specified (GET, POST, etc.)
   - Build path from arguments before `--`
   - Process parameters after `--` separator

2. **Endpoint Resolution**:
   - Load API specification from `serverAPIPath`
   - Match path against endpoint patterns
   - Determine HTTP method from spec if not provided

3. **Request Building**:
   - Construct URL with query parameters (for non-POST)
   - Add JSON body for POST requests
   - Set appropriate headers (Accept, Content-Type, X-CWD)

4. **Response Handling**:
   - Process Question-and-Answer flows if indicated
   - Handle file attachments (save to disk)
   - Format and display JSON/text/terminal responses

## Special Features

### Auto-Start Server
If server is not running, CLI automatically:
1. Spawns server process in background
2. Waits for server to become available
3. Retries original request

### Tab Completion
Supports bash and zsh completion:
- Discovers available endpoints from API spec
- Provides context-aware suggestions
- Installed during `--setup` process

### Interactive Mode
When run without arguments:
- Provides REPL-like interface
- Maintains session state
- Exit with '.' or Ctrl+C

### Question-and-Answer Flows
Server can request additional input:
- Indicated by `X-Question-and-Answer` header
- CLI prompts user for required information
- Supports complex multi-step workflows

## Recent Changes

- Added YAML format support in `extToMime()` function
- Commented out format parameter from data array (works without explicit inclusion)

## Testing

Test files location: `/src/lib/lib/test/process-command.test.js`

## Dependencies

Key dependencies:
- `@liquid-labs/plugable-express`: Server-side framework
- `@liquid-labs/terminal-text`: Terminal formatting
- `@liquid-labs/wrap-text`: Text wrapping utilities
- `@liquid-labs/question-and-answer`: Interactive Q&A handling
- `js-yaml`: YAML parsing
- `shlex`: Shell-like command parsing

## Development Notes

### Building and Testing
```bash
npm run build   # Build the project
npm run test    # Run tests
npm run lint    # Run linter
npm run qa      # Run full QA suite
```

### File Conventions
- `.mjs` files for ES modules
- Functional programming style
- Async/await for asynchronous operations
- Parameter destructuring for function arguments

### Error Handling
- Connection refused triggers auto-start
- Missing API spec handled gracefully
- User-friendly error messages with formatting

## Integration Points

1. **Server API Specification**: JSON file describing available endpoints
2. **CLI Settings File**: YAML configuration for terminal and other settings
3. **Completion Scripts**: Shell-specific completion configurations
4. **Environment Variables**: `HOME`, `SHELL` for setup processes