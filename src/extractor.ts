import * as github from '@actions/github'
import {Octokit} from './types'

async function extractPRTitle(): Promise<string> {
    const title = github.context?.payload?.pull_request?.title
    if (!title) {
        throw new Error('Unable to retrieve PR title.')
    }
    return title
}

async function extractBranchName(): Promise<string> {
    const branchName = process.env.GITHUB_HEAD_REF as string

    if (!branchName) {
        throw new Error('Unable to retrieve the branch name.')
    }
    return branchName
}

async function extractCommitsMessages(octokit: Octokit): Promise<string[]> {
    const pr = github.context?.issue

    if (!pr) {
        throw new Error('Unable to retrieve PR data.')
    }

    const response = await octokit.rest.pulls.listCommits({
        owner: pr.owner,
        repo: pr.repo,
        pull_number: pr.number
    })
    return response.data.map(commit => commit.commit.message)
}

interface Extractors {
    [key: string]: (octokit: Octokit) => Promise<string[]>
}

const extractors: Extractors = {
    branch: async () => [await extractBranchName()],
    title: async () => [await extractPRTitle()],
    commit: extractCommitsMessages
}

export async function extractAll(octokit: Octokit, sources: string[]): Promise<string[]> {
    const promises = sources.map(async source => {
        const extractor = extractors[source]
        if (!extractor) {
            throw new Error(`Unknown source: ${source}`)
        }
        return extractor(octokit)
    })

    return (await Promise.all(promises)).flat()
}
