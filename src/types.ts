import {GitHub} from '@actions/github/lib/utils'

export type Octokit = InstanceType<typeof GitHub>

export type IssueLink = {
    url: string
    name: string
}
