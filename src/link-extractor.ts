import './array-utils'
import {IssueLink} from './types'

export function getLinks(issueIdPattern: string, linkTemplate: string, linkNameTemplate: string, inputs: string[]): IssueLink[] {
    const issueIdRegex = new RegExp(issueIdPattern, 'g')
    return inputs
        .flatMap(message => [...message.matchAll(issueIdRegex)])
        .filterNotNull()
        .map(match => getLink(linkTemplate, linkNameTemplate, match))
        .uniqBy(link => link.url)
}

function getLink(linkTemplate: string, linkNameTemplate: string, match: RegExpMatchArray): IssueLink {
    let url = linkTemplate
    let name = linkNameTemplate
    for (const [index, group] of match.entries()) {
        url = url.replace(`$${index}`, group)
        name = name.replace(`$${index}`, group)
    }
    return {name, url}
}
