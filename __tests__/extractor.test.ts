import {expect, test, describe, beforeEach, afterEach, jest} from '@jest/globals'
import * as github from '@actions/github'
import {extractAll} from '../src/extractor'

const mockContext = github.context as unknown as {
    issue: {owner: string; repo: string; number: number} | null
    payload: {pull_request: {title: string} | null}
    eventName: string
}

const mockListCommits = jest.fn<() => Promise<any>>()
const mockOctokit = {
    rest: {
        pulls: {
            listCommits: mockListCommits
        }
    }
} as any

describe('extractAll', () => {
    beforeEach(() => {
        mockContext.issue = null
        mockContext.payload = {pull_request: null}
    })

    afterEach(() => {
        delete process.env.GITHUB_HEAD_REF
    })

    describe('branch source', () => {
        test('should extract branch name from GITHUB_HEAD_REF', async () => {
            process.env.GITHUB_HEAD_REF = 'feature/PROJ-123'
            const result = await extractAll(mockOctokit, ['branch'])
            expect(result).toEqual(['feature/PROJ-123'])
        })

        test('should throw when GITHUB_HEAD_REF is not set', async () => {
            await expect(extractAll(mockOctokit, ['branch'])).rejects.toThrow('Unable to retrieve the branch name.')
        })
    })

    describe('title source', () => {
        test('should extract PR title from context', async () => {
            mockContext.payload = {pull_request: {title: 'Fix PROJ-456: some bug'}}
            const result = await extractAll(mockOctokit, ['title'])
            expect(result).toEqual(['Fix PROJ-456: some bug'])
        })

        test('should throw when pull_request payload is null', async () => {
            mockContext.payload = {pull_request: null}
            await expect(extractAll(mockOctokit, ['title'])).rejects.toThrow('Unable to retrieve PR title.')
        })

        test('should throw when pull_request title is missing', async () => {
            mockContext.payload = {pull_request: {title: ''}}
            await expect(extractAll(mockOctokit, ['title'])).rejects.toThrow('Unable to retrieve PR title.')
        })
    })

    describe('commit source', () => {
        test('should extract commit messages via octokit', async () => {
            mockContext.issue = {owner: 'myorg', repo: 'myrepo', number: 42}
            mockListCommits.mockResolvedValue({
                data: [{commit: {message: 'Fix PROJ-123'}}, {commit: {message: 'Refactor things'}}]
            })
            const result = await extractAll(mockOctokit, ['commit'])
            expect(result).toEqual(['Fix PROJ-123', 'Refactor things'])
            expect(mockListCommits).toHaveBeenCalledWith({owner: 'myorg', repo: 'myrepo', pull_number: 42})
        })

        test('should return empty array when PR has no commits', async () => {
            mockContext.issue = {owner: 'myorg', repo: 'myrepo', number: 1}
            mockListCommits.mockResolvedValue({data: []})
            const result = await extractAll(mockOctokit, ['commit'])
            expect(result).toEqual([])
        })

        test('should throw when issue context is null', async () => {
            mockContext.issue = null
            await expect(extractAll(mockOctokit, ['commit'])).rejects.toThrow('Unable to retrieve PR data.')
        })
    })

    describe('multiple sources', () => {
        test('should combine results from multiple sources', async () => {
            process.env.GITHUB_HEAD_REF = 'feature/PROJ-123'
            mockContext.payload = {pull_request: {title: 'Fix PROJ-456'}}
            const result = await extractAll(mockOctokit, ['branch', 'title'])
            expect(result).toEqual(['feature/PROJ-123', 'Fix PROJ-456'])
        })

        test('should return empty array for empty sources list', async () => {
            const result = await extractAll(mockOctokit, [])
            expect(result).toEqual([])
        })
    })

    test('should throw for unknown source', async () => {
        await expect(extractAll(mockOctokit, ['unknown'])).rejects.toThrow('Unknown source: unknown')
    })
})
