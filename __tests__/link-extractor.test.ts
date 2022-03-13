import {expect, test} from '@jest/globals'
import {getLinks} from '../src/link-extractor'

test('should generate simple link', async () => {
    const result = getLinks('[A-Z][A-Z]+-\\d+', 'https://example.com/browse/$0', 'skip', ['some text with PROJ-1234 issue in it']).map(x => x.url)
    expect(result).toEqual(['https://example.com/browse/PROJ-1234'])
})

test('should generate link by subgroup match', async () => {
    const result = getLinks('#(\\d+)', 'https://example.com/issues/$1', 'skip', ['some text with #123 issue in it']).map(x => x.url)
    expect(result).toEqual(['https://example.com/issues/123'])
})

test('should generate multiple links from single message', async () => {
    const result = getLinks('#(\\d+)', 'https://example.com/issues/$1', 'skip', ['some text with #123 and #234 issues in it']).map(x => x.url)
    expect(result).toEqual(['https://example.com/issues/123', 'https://example.com/issues/234'])
})

test('its okay to extract nothing', async () => {
    const result = getLinks('#(\\d+)', 'https://example.com/issues/$1', 'skip', ['some text without issue links'])
    expect(result).toEqual([])
})

test('should generate multiple uniq links', async () => {
    const result = getLinks('[A-Z][A-Z]+-\\d+', 'https://example.com/browse/$0', 'skip', [
        'some text with PROJ-1234 issue in it',
        'some text with no issues in it',
        'some text with PROJ-1234 again',
        'some text with PROJ-23344'
    ]).map(x => x.url)
    expect(result).toEqual(['https://example.com/browse/PROJ-1234', 'https://example.com/browse/PROJ-23344'])
})

test('should also generate names', async () => {
    const result = getLinks('#(\\d+)', 'skip', 'Issue №$1', ['some text with #123 issue in it']).map(x => x.name)
    expect(result).toEqual(['Issue №123'])
})
