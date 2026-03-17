import {expect, test, describe, beforeEach, jest} from '@jest/globals'
import * as github from '@actions/github'
import {addLinks, getInserter, publishLinks} from '../src/link-publisher'

const mockContext = github.context as unknown as {
    issue: {owner: string; repo: string; number: number} | null
    payload: {pull_request: {title: string} | null}
    eventName: string
}

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

describe('publishLinks', () => {
    const mockGet = jest.fn<() => Promise<any>>()
    const mockUpdate = jest.fn<() => Promise<any>>()
    const mockOctokit = {
        rest: {
            pulls: {
                get: mockGet,
                update: mockUpdate
            }
        }
    } as any

    beforeEach(() => {
        mockContext.issue = {owner: 'myorg', repo: 'myrepo', number: 7}
        mockGet.mockResolvedValue({data: {body: 'Initial PR description'}})
        mockUpdate.mockResolvedValue({})
    })

    test('should update PR body when new links need to be added', async () => {
        const inserter = getInserter('end')
        await publishLinks(mockOctokit, sampleLinks, 'Related: ', inserter)
        expect(mockUpdate).toHaveBeenCalledWith({
            owner: 'myorg',
            repo: 'myrepo',
            pull_number: 7,
            body: 'Initial PR description\n\nRelated: [related issue](https://example.com/1234), [1234](https://ov7a.github.io/)'
        })
    })

    test('should not update PR body when all links are already present', async () => {
        const textWithLinks = 'Desc with https://example.com/1234 and https://ov7a.github.io/'
        mockGet.mockResolvedValue({data: {body: textWithLinks}})
        const inserter = getInserter('end')
        await publishLinks(mockOctokit, sampleLinks, 'Related: ', inserter)
        expect(mockUpdate).not.toHaveBeenCalled()
    })

    test('should treat null PR body as empty string', async () => {
        mockGet.mockResolvedValue({data: {body: null}})
        const inserter = getInserter('end')
        await publishLinks(mockOctokit, sampleLinks, '', inserter)
        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.stringContaining('https://example.com/1234')
            })
        )
    })

    test('should throw when PR context is not available', async () => {
        mockContext.issue = null
        const inserter = getInserter('end')
        await expect(publishLinks(mockOctokit, sampleLinks, '', inserter)).rejects.toThrow('Unable to retrieve PR data.')
    })
})
