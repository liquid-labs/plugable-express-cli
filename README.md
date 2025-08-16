# @liquid-labs/plugable-express-cli

Used to create a CLI interface to any plugable-express server providing integrated endpoint discovery, tab completion, interactive mode, and help.

## Overview

This library provides a framework for building command-line interfaces that seamlessly communicate with plugable-express servers. When you create a CLI using this framework, it automatically:

- **Discovers server endpoints** through the server's API specification
- **Provides tab completion** for all available commands and parameters
- **Auto-starts the server** if it's not already running
- **Handles interactive Q&A flows** for complex operations
- **Formats responses** appropriately for terminal display
- **Supports interactive mode** with a REPL-like interface for continuous interaction

The CLI dynamically adapts to the server's capabilities, meaning that as new endpoints are added to the server, they immediately become available through the CLI without any CLI code changes.

For example, [`sdlcpilot-cli`](https://github.com/liquid-labs/sdlcpilot-cli) uses this framework to create a CLI interface for the [`comply-server`](https://github.com/liquid-labs/comply-server), providing commands for software development lifecycle management. The CLI automatically discovers all available commands from the server and provides a rich, interactive experience.

## Usage

### Installation

```bash
npm install @liquid-labs/plugable-express-cli
```

### Creating Your CLI

Create a CLI executable file that configures and starts the CLI interface. Here's an example from [`sdlcpilot-cli`](https://github.com/liquid-labs/sdlcpilot-cli/blob/main/src/sdlcpilot-cli.mjs):

```javascript
import { readFileSync } from 'node:fs'
import * as fsPath from 'node:path'

import { startCLI } from '@liquid-labs/plugable-express-cli'

// Function to get version from package.json
const getVersion = () => {
  const packagePath = fsPath.resolve(__dirname, '..', 'package.json')
  const pkgJSON = JSON.parse(readFileSync(packagePath, { encoding: 'utf8' }))
  return pkgJSON.version
}

// Configure CLI settings
const cliSettings = {
  cliName: 'sdlc',                    // Your CLI command name
  getVersion,                         // Version function
  port: 8080,                         // Server port
  serverAPIPath: '/path/to/api.json', // API specification path
  serverExec: 'comply-server',        // Server executable command
  serverHome: '/path/to/server/home', // Server home directory
  serverPackage: 'comply-server',     // NPM package name of server
  serverVersion: 'latest',            // Server version to install
  
  // Optional settings
  protocol: 'http',                   // Default: 'http'
  server: '127.0.0.1',                // Default: '127.0.0.1'
  defaultRegistries: ['https://registry.npmjs.org'], // NPM registries
  localServerDevPaths: ['/path/to/local/server']     // For development
}

// Start the CLI
const startMyCLI = async() => await startCLI(cliSettings)

export { startMyCLI }
```

### Required Settings

- `cliName`: The command name users will type to run your CLI
- `port`: Port number where the server runs
- `serverPackage`: NPM package name of the plugable-express server

### Optional Settings

- `getVersion`: Function returning the CLI version
- `protocol`: HTTP protocol (default: 'http')
- `server`: Server hostname (default: '127.0.0.1')
- `serverAPIPath`: Path to the server's API specification file
- `serverExec`: Command to execute the server
- `serverHome`: Server's home directory for data storage
- `serverVersion`: Version of the server package to use
- `defaultRegistries`: NPM registries for server installation
- `localServerDevPaths`: Local paths for development servers

### First-Time Setup

When users first run your CLI, they'll need to run the setup command:

```bash
your-cli --setup
```

This will:
1. Create the CLI home directory
2. Configure CLI settings
3. Install the server package
4. Set up tab completion for bash/zsh
5. Initialize server settings

### Using the CLI

Once set up, users can:

**Run commands directly:**
```bash
your-cli users list -- format=yaml
```

**Enter interactive mode:**
```bash
your-cli
> users list -- format=yaml
> .  # Exit
```

**Use tab completion:**
```bash
your-cli [TAB]  # Shows available commands
```

The CLI automatically handles HTTP methods, path construction, and parameter passing based on the server's API specification.