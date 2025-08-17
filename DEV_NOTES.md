# Developer Notes

## Design Philosophy

This library provides a thin, flexible framework layer between a CLI interface and plugable-express servers. The design emphasizes:

- **Dynamic discovery** over static configuration
- **Convention over configuration** for common patterns
- **Separation of concerns** between CLI logic and server business logic
- **Zero-coupling** to specific server implementations

## Architecture

### Layered Structure

1. **Entry Point** (`plugable-express-cli.mjs`)
   - Validates settings
   - Manages interactive/non-interactive modes
   - Handles the main event loop

2. **Command Processing Pipeline**
   - `process-input.mjs` → `call-endpoint.mjs` → `process-command.mjs`
   - Transforms CLI arguments into HTTP requests
   - Handles response formatting

3. **Special Operations**
   - `process-special.mjs`: Version, setup flows
   - `setup-cli-*.mjs`: Installation and configuration
   - `process-qna.mjs`: Interactive Q&A handling

See [CLAUDE.md](./CLAUDE.md#project-structure) for detailed file descriptions.

## Development Workflow

### Building

```bash
npm run build    # Builds distribution bundle
npm run test     # Runs test suite
npm run lint     # Lints code
npm run qa       # Full QA suite (test + lint)
```

### Testing

- Unit tests in `src/lib/lib/test/`
- Test uses environment variable `TEST_METHOD` for method injection
- Mock server responses for endpoint testing

### Making Changes

1. **Adding Format Support**
   - Update `extToMime()` in `process-command.mjs`
   - Format parameter affects `Accept` header only

2. **Modifying Command Processing**
   - Arguments before `--` become path segments
   - Arguments after `--` become parameters
   - Special handling for `format` parameter (sets Accept header)

3. **Adding Special Commands**
   - Implement in `process-special.mjs`
   - Return `true` to prevent normal processing

## Key Design Decisions

### Server Auto-Start
The CLI automatically starts the server if not running, using detached spawning to ensure the server persists beyond the CLI session.

### API Discovery
Server endpoints are discovered from `serverAPIPath` JSON file, allowing the CLI to adapt dynamically to server changes.

### Parameter Handling
- GET requests: Parameters go in query string
- POST requests: Parameters go in JSON body
- Multivalue parameters supported via endpoint spec

### Response Processing
1. Check for Q&A header → Interactive flow
2. Check disposition → File download
3. Otherwise → Terminal display (with format detection)

## Configuration

### Required Settings
Minimal configuration needed:
- `cliName`: Command name
- `port`: Server port  
- `serverPackage`: NPM package name

### Optional Settings
See [CLAUDE.md](./CLAUDE.md#cli-settings-configuration) for complete list.

## Code Conventions

- **ES Modules**: Use `.mjs` extension
- **Async/Await**: Preferred over promises
- **Destructuring**: For function parameters
- **Error Handling**: Let errors bubble up with context

## Common Patterns

### Adding Server Communication
```javascript
const response = await callEndpoint({ args, cliSettings })
// Process response...
```

### Format Negotiation
```javascript
// Format parameter sets Accept header
if (name === 'format') {
  accept = extToMime(value)
  // Don't include in request data
}
```

### Server Status Check
```javascript
try {
  await fetch(url, fetchOpts)
} catch (e) {
  if (e.code === 'ECONNREFUSED') {
    await startServer({ cliSettings, rootURL })
    // Retry...
  }
}
```

## Integration Points

1. **Server API Spec**: JSON file describing endpoints
2. **CLI Settings**: YAML configuration file
3. **Completion Scripts**: Shell-specific scripts
4. **Environment Variables**: `HOME`, `SHELL`, `TEST_METHOD`

## Debugging Tips

- Check `serverAPIPath` for endpoint discovery issues
- Verify server is running on expected port
- Use `TEST_METHOD` env var to force HTTP methods
- Check `~/.bash_completion` for completion issues

## Future Considerations

- Migration to native zsh completion (see TODO in code)
- WebSocket support for real-time operations
- Plugin system for custom command processors
- Enhanced error recovery mechanisms