module.exports = {
  context: {
    issue: null,
    payload: {pull_request: null},
    eventName: ''
  },
  getOctokit: jest.fn()
}
