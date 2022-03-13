import * as core from '@actions/core'
import * as github from '@actions/github'

import { extractAll } from './extractor'
import { getInserter, publishLinks } from './linkPublisher'
import { getLinks } from './linkGenerator'

async function run(): Promise<void> {
    try {
        validateEvent()

        const sources = core.getMultilineInput("sources")?.map(source => source.trim())
        const issueIdPattern = core.getInput("issue-pattern")?.trim()
        const linkTemplate = core.getInput("link-template")?.trim()
        const linkName = core.getInput("link-name")?.trim()
        const linkLocation = core.getInput("link-location")?.trim()
        const token = core.getInput("token")?.trim()

        const inserter = getInserter(linkLocation)

        const octokit = github.getOctokit(token)

        const messages = await extractAll(octokit, sources)
        const links = getLinks(issueIdPattern, linkTemplate, messages)
        if (links.length) {
            publishLinks(octokit, links, linkName, inserter)
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

const VALID_EVENTS = new Set(['pull_request', 'pull_request_target'])

function validateEvent() {
    const event = github.context.eventName
    if (!VALID_EVENTS.has(event)) {
        throw new Error(`This action works only for pull requests, but has been triggered for ${event}`)
    }
}

run()
