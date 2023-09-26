/* global afterAll beforeAll describe expect test */

import { processCommand } from '../process-command'

const port = 32600
const protocol = 'http'
const server = '127.0.0.1'

const cliSettings = { port, protocol, server }

describe('processCommand', () => {
  beforeAll(() => { process.env.TEST_METHOD = 'GET' })
  afterAll(() => delete process.env.TEST_METHOD)

  test.each([
    [[], '/'],
    [['foo'], '/foo'],
    [['foo', 'bar'], '/foo/bar'],
    [['foo bar', 'baz'], '/foo%20bar/baz']
  ])("command '%s' yields path '%s'", async(args, expectedPath) => {
    const { path } = await processCommand({ args, cliSettings })
    expect(path).toEqual(expectedPath)
  })

  test('processes leading method', async() => {
    const { method, path } = await processCommand({ args : ['POST', 'foo', 'bar'], cliSettings })
    expect(method).toBe('POST')
    expect(path).toBe('/foo/bar')
  })

  test.each([
    [['foo=1'], [['foo', '1']]],
    [['bar=hey there'], [['bar', 'hey there']]],
    [['baz'], [['baz', 'true']]],
    [['foo=1', 'baz'], [['foo', '1'], ['baz', 'true']]]
  ])("parameter '%s' yields '%p'", async(param, expectedData) => {
    const { data } = await processCommand({ args : ['foo', '--', ...param], cliSettings })
    expect(data).toEqual(expectedData)
  })

  test.each([
    [['POST', 'work', 'create', '--', 'bar=1'], '/work/create'],
    [['GET', 'foo', 'bar', '--', 'baz=1'], '/foo/bar?baz=1'],
    [['GET', 'foo', 'bar', '--', 'baz=1', 'bobo'], '/foo/bar?baz=1&bobo=true']
  ])(`command '%p' yields url '${protocol}://${server}:${port}%s'`, async(args, expectedPath) => {
    const { url } = await processCommand({ args, cliSettings })
    expect(url).toBe(`${protocol}://${server}:${port}${expectedPath}`)
  })
})
