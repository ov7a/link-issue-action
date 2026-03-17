import {expect, test, describe, beforeEach, jest} from '@jest/globals'
import * as github from '@actions/github'

const mockContext = github.context as unknown as {
    issue: {owner: string; repo: string; number: number} | null
    payload: {pull_request: {title: string} | null}
    eventName: string
}

jest.mock('@actions/core', () => ({
    getMultilineInput: jest.fn(),
    getInput: jest.fn(),
    info: jest.fn(),
    setFailed: jest.fn()
}))

jest.mock('../src/extractor', () => ({
    extractAll: jest.fn()
}))

jest.mock('../src/link-extractor', () => ({
    getLinks: jest.fn()
}))

jest.mock('../src/link-publisher', () => ({
    getInserter: jest.fn(),
    publishLinks: jest.fn()
}))

import * as core from '@actions/core'
import {extractAll} from '../src/extractor'
import {getLinks} from '../src/link-extractor'
import {getInserter, publishLinks} from '../src/link-publisher'
import {run, validateEvent} from '../src/main'

const mockGetMultilineInput = core.getMultilineInput as jest.MockedFunction<typeof core.getMultilineInput>
const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>
const mockSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>
const mockExtractAll = extractAll as jest.MockedFunction<typeof extractAll>
const mockGetLinks = getLinks as jest.MockedFunction<typeof getLinks>
const mockGetInserter = getInserter as jest.MockedFunction<typeof getInserter>
const mockPublishLinks = publishLinks as jest.MockedFunction<typeof publishLinks>

describe('validateEvent', () => {
    test('should not throw for pull_request event', () => {
        mockContext.eventName = 'pull_request'
        expect(() => validateEvent()).not.toThrow()
    })

    test('should not throw for pull_request_target event', () => {
        mockContext.eventName = 'pull_request_target'
        expect(() => validateEvent()).not.toThrow()
    })

    test('should throw for push event', () => {
        mockContext.eventName = 'push'
        expect(() => validateEvent()).toThrow(
            'This action works only for pull requests, but has been triggered for push'
        )
    })

    test('should throw for schedule event', () => {
        mockContext.eventName = 'schedule'
        expect(() => validateEvent()).toThrow('This action works only for pull requests, but has been triggered for schedule')
    })
})

describe('run', () => {
    beforeEach(() => {
        mockContext.eventName = 'pull_request'
        mockContext.issue = {owner: 'myorg', repo: 'myrepo', number: 1}

        mockGetMultilineInput.mockReturnValue(['branch'])
        mockGetInput.mockImplementation((name: string) => {
            const inputs: Record<string, string> = {
                'issue-pattern': '#(\\d+)',
                'link-template': 'https://example.com/issues/$1',
                'link-name-template': 'Issue #$1',
                'link-preamble': 'Related: ',
                'link-location': 'end',
                token: 'fake-token'
            }
            return inputs[name] ?? ''
        })

        const mockInserter = (input: string, text: string) => `${input}\n\n${text}`
        mockGetInserter.mockReturnValue(mockInserter)
        mockExtractAll.mockResolvedValue(['Fix #123'])
        mockGetLinks.mockReturnValue([{url: 'https://example.com/issues/123', name: 'Issue #123'}])
        mockPublishLinks.mockResolvedValue()
        ;(github.getOctokit as jest.Mock).mockReturnValue({})
    })

    test('should run successfully for pull_request event', async () => {
        await run()
        expect(mockSetFailed).not.toHaveBeenCalled()
        expect(mockPublishLinks).toHaveBeenCalled()
    })

    test('should run successfully for pull_request_target event', async () => {
        mockContext.eventName = 'pull_request_target'
        await run()
        expect(mockSetFailed).not.toHaveBeenCalled()
    })

    test('should call setFailed for invalid event', async () => {
        mockContext.eventName = 'push'
        await run()
        expect(mockSetFailed).toHaveBeenCalledWith(
            'This action works only for pull requests, but has been triggered for push'
        )
    })

    test('should not publish when no links are found', async () => {
        mockGetLinks.mockReturnValue([])
        await run()
        expect(mockPublishLinks).not.toHaveBeenCalled()
        expect(mockSetFailed).not.toHaveBeenCalled()
    })

    test('should call setFailed when extractAll throws', async () => {
        mockExtractAll.mockRejectedValue(new Error('extraction failed'))
        await run()
        expect(mockSetFailed).toHaveBeenCalledWith('extraction failed')
    })
})
