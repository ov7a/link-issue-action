import "./utils"

export function getLinks(
    issueIdPattern: string,
    linkTemplate: string,
    inputs: string[]
): string[] {
    const issueIdRegex = new RegExp(issueIdPattern, 'g')
    return inputs
        .flatMap(message => [...message.matchAll(issueIdRegex)])
        .filterNotNull()
        .map(match => getLink(linkTemplate, match))
        .uniq()
}

function getLink(linkTemplate: string, match: RegExpMatchArray): string {
    let result = linkTemplate
    match.forEach((group, index) => {
        result = result.replace(`$${index}`, group)
    })
    return result
}

