import {expect, test} from '@jest/globals'
import {addLinks, getInserter} from '../src/link-publisher'

const sampleLinks = [
    {url: 'https://example.com/1234', name: 'related issue'},
    {url: 'https://ov7a.github.io/', name: '1234'}
]

test('should insert links at the beginning', async () => {
    const text = 'Some pr description bla\n\nbla bla'
    const inserter = getInserter('start')
    const result = addLinks(text, sampleLinks, 'Related issues: ', inserter)
    expect(result).toEqual('Related issues: [related issue](https://example.com/1234), [1234](https://ov7a.github.io/)\n\nSome pr description bla\n\nbla bla')
})

test('should insert links at the end', async () => {
    const text = 'Some pr description bla\n\nbla bla'
    const inserter = getInserter('end')
    const result = addLinks(text, sampleLinks, 'See issues: ', inserter)
    expect(result).toEqual('Some pr description bla\n\nbla bla\n\nSee issues: [related issue](https://example.com/1234), [1234](https://ov7a.github.io/)')
})

test('should not insert link if it is already in text', async () => {
    const text = 'Some pr description bla\n\nbla bla\n\n[some issue](https://example.com/1234)\n\nAnd maybe some other text'
    const inserter = getInserter('end')
    const result = addLinks(text, sampleLinks, 'Related issues: ', inserter)
    expect(result).toEqual(
        'Some pr description bla\n\nbla bla\n\n[some issue](https://example.com/1234)\n\nAnd maybe some other text\n\nRelated issues: [1234](https://ov7a.github.io/)'
    )
})

test('should not insert anything if all links are already in text', async () => {
    const text = 'Some pr description bla\n\nbla bla\n\n[Related issue](https://example.com/1234)\n\nAnd maybe some other text: https://ov7a.github.io/'
    const inserter = getInserter('end')
    const result = addLinks(text, sampleLinks, 'Related issue', inserter)
    expect(result).toEqual(text)
})

test('preamble can be empty', async () => {
    const text = 'Some pr description bla\n\nbla bla'
    const inserter = getInserter('end')
    const result = addLinks(text, sampleLinks, '', inserter)
    expect(result).toEqual('Some pr description bla\n\nbla bla\n\n[related issue](https://example.com/1234), [1234](https://ov7a.github.io/)')
})

test('should fail on unknown link location', async () => {
    expect(() => getInserter('I dont know')).toThrow('Invalid linkLocation: I dont know')
})
