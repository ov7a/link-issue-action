import * as github from '@actions/github'
import {IssueLink, Octokit} from './types'

type Inserter = (input: string, text: string) => string

interface Inserters {
    [key: string]: Inserter
}

const inserters: Inserters = {
    start: (input, text) => `${text}\n\n${input}`,
    end: (input, text) => `${input}\n\n${text}`
}

export function getInserter(linkLocation: string): Inserter {
    const inserter = inserters[linkLocation]
    if (!inserter) {
        throw new Error(`Invalid linkLocation: ${linkLocation}`)
    }
    return inserter
}

export async function publishLinks(octokit: Octokit, links: IssueLink[], linkPreamble: string, inserter: Inserter): Promise<void> {
    const text = getPrText()

    const updatedText = addLinks(text, links, linkPreamble, inserter)

    if (updatedText !== text) {
        updatePrText(octokit, updatedText)
    }
}

export function addLinks(text: string, links: IssueLink[], linkPreamble: string, inserter: Inserter): string {
    const linksText = links
        .filter(link => !text.includes(link.url))
        .map(link => `[${link.name}](${link.url})`)
        .join(', ')

    if (linksText) {
        return inserter(text, `${linkPreamble}${linksText}`)
    } else {
        return text
    }
}

function getPrText(): string {
    const body = github.context?.payload?.pull_request?.body
    if (!body) {
        throw new Error('Unable to retrieve PR text.')
    }
    return body
}

async function updatePrText(octokit: Octokit, text: string): Promise<void> {
    const pr = github.context?.issue

    if (!pr) {
        throw new Error('Unable to retrieve PR data.')
    }

    await octokit.rest.pulls.update({
        owner: pr.owner,
        repo: pr.repo,
        pull_number: pr.number,
        body: text
    })
}
