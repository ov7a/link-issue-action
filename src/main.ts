import * as core from '@actions/core'
import * as github from '@actions/github'

import {getInserter, publishLinks} from './link-publisher'
import {extractAll} from './extractor'
import {getLinks} from './link-extractor'

async function run(): Promise<void> {
    try {
        validateEvent()

        const sources = core.getMultilineInput('sources')
        const issueIdPattern = core.getInput('issue-pattern')
        const linkTemplate = core.getInput('link-template')
        const linkNameTemplate = core.getInput('link-name-template')
        const linkPreamble = core.getInput('link-preamble', {trimWhitespace: false})
        const linkLocation = core.getInput('link-location')
        const token = core.getInput('token')

        const inserter = getInserter(linkLocation)

        const octokit = github.getOctokit(token)

        const messages = await extractAll(octokit, sources)
        core.info(`Got messages: ${messages.join(', ')}`)

        const links = getLinks(issueIdPattern, linkTemplate, linkNameTemplate, messages)
        core.info(`Got links: ${links.map(l => l.url).join(', ')}`)

        if (links.length) {
            publishLinks(octokit, links, linkPreamble, inserter)
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

const VALID_EVENTS = new Set(['pull_request', 'pull_request_target'])

function validateEvent(): void {
    const event = github.context.eventName
    if (!VALID_EVENTS.has(event)) {
        throw new Error(`This action works only for pull requests, but has been triggered for ${event}`)
    }
}

run()
