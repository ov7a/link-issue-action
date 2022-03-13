import * as github from '@actions/github';
import { Octokit } from './utils';

type Inserter = (input: string, text: string) => string

interface Inserters {
    [key: string]: Inserter
}

const inserters: Inserters = {
    'start': (input, text) => `${text}\n\n${input}`,
    'end': (input, text) => `${input}\n\n${text}`,
}

export function getInserter(linkLocation: string): Inserter {
    const inserter = inserters[linkLocation]
    if (!inserter) {
        throw new Error(`Invalid linkLocation: ${linkLocation}`)
    }
    return inserter
}

export async function publishLinks(
    octokit: Octokit,
    links: string[],
    linkName: string,
    inserter: Inserter
) {
    const text = getPrText();

    const updatedText = addLinks(text, links, linkName, inserter)

    if (updatedText != text) {
        updatePrText(octokit, updatedText)
    }
}

export function addLinks(
    text: string,
    links: string[],
    linkName: string,
    inserter: Inserter
): string {
    let linksText = links
        .filter(link => !text.includes(link))
        .map(link => makeLinkText(linkName, link))
        .join("\n\n")

    if (linksText) {
        return inserter(text, linksText)
    } else {
        return text
    }
}

export function makeLinkText(linkName: string, link: string) {
    let name = linkName
    if (!linkName) {
        name = link;
    }
    return `[${name}](${link})`
}

export function getPrText(): string {
    const body = github.context?.payload?.pull_request?.body
    if (!body) {
        throw new Error('Unable to retrieve PR text.')
    }
    return body
}

export async function updatePrText(octokit: Octokit, text: string) {
    const pr = github.context?.issue

    if (!pr) {
        throw new Error('Unable to retrieve PR data.')
    }

    await octokit.rest.pulls.update({
        owner: pr.owner,
        repo: pr.repo,
        pull_number: pr.number,
        body: text,
    });
}