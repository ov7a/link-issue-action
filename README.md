<p align="center">
  <a href="https://github.com/ov7a/link-issue-action/actions"><img alt="build status" src="https://github.com/ov7a/link-issue-action/workflows/build/badge.svg"></a>
  <a href="https://github.com/ov7a/link-issue-action/actions"><img alt="build status" src="https://github.com/ov7a/link-issue-action/workflows/check-dist/badge.svg"></a>
</p>

# Link issue Github Action

This Github action can be used to automatically link PRs to issues from external trackers (JIRA, Redmine, etc) by issue id.

## Action inputs

The possible inputs for this action are:

| Parameter | Required? | Default | Description |
| --------- | --------- | ------- | ----------- |
| sources   | no        | branch, title, commit | A list of locations where issue id should be taken from. Possible values: branch, title, commit. |
| issue-pattern | yes   | | A regex to match and extract issue id. For example, use `[A-Z][A-Z]+-\d+` for JIRA issues or `#(\d+)` for Redmine issues. |
| link-template | yes   | |  Link template to paste id or its part into. You should use regex groups here. Example: `https://example.com/browse/issues/$0` |
| link-name-template | no | `$0` | Template for link name |
| link-preamble | no    | Related issues | Text before list of links |
| link-location | no    | end | Location to paste link to. Possible values: `start`, `end`. |
| token     | no        | GITHUB_TOKEN | [GitHub token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) |


## Examples

Link JIRA issue from PR title, append to the end of message:

```yaml
name: Link issue

on:
  pull_request:
    types: [opened, edited]

jobs:
  link-jira-issue:
    name: Link Jira Issue
    runs-on: ubuntu-latest
    steps:
      - name: Link Jira Issue
        uses: ov7a/link-issue-action@v1
        with:
          sources: title
          issue-pattern: '[A-Z][A-Z]+-\d'
          link-template: 'https://somedomain.atlassian.net/browse/$0'
```

Link Redmine issue from commits messages and branch name, append to the start of message:

```yaml
name: Link issue

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  link-redmine-issue:
    name: Link Redmine Issue
    runs-on: ubuntu-latest
    steps:
      - name: Link Redmine Issue
        uses: ov7a/link-issue-action@v1
        with:
          sources: |
            branch
            commit
          issue-pattern: '#(\d+)'
          link-template: 'https://somedomain.com/issues/$1'
          link-location: start
```

## Building

```bash
npm run all
```
