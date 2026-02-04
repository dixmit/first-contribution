/**
 * Unit tests for the action's `is_first_time_contributor` util.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { is_first_time_contributor } from '~src/utils/index.ts'
import { core_getInput_spy_mock, is_first_time_contributor_spy, octokit } from '~tests/helpers.ts'
import { octokit_listCommits_mock, octokit_issuesAndPullRequests_mock } from '~tests/setup.ts'

describe('is_first_time_contributor()', () => {
  const default_opts = {
    creator: 'ghosty',
    owner: 'owner',
    repo: 'repo'
  }

  describe('contribution-mode = once', () => {
    beforeEach(() => {
      // Ensure no commits are found for these tests
      octokit_listCommits_mock.mockResolvedValue({ data: [] })
      core_getInput_spy_mock.mockReturnValue('once')
    })

    it('returns true if the user has only one contribution (issue or PR)', async () => {
      octokit_issuesAndPullRequests_mock.mockReturnValue({ data: {items: [{}] }})

      await is_first_time_contributor(octokit, { ...default_opts, is_pull_request: false })

      expect(is_first_time_contributor_spy).toHaveResolvedWith(true)
    })

    it('returns false if the user has multiple contributions', async () => {
      octokit_issuesAndPullRequests_mock.mockReturnValue({ data: {items: [{}, { pull_request: {} }] }})

      await is_first_time_contributor(octokit, { ...default_opts, is_pull_request: false })

      expect(is_first_time_contributor_spy).toHaveResolvedWith(false)
    })
  })

  describe('contribution-mode = (default)', () => {
    beforeEach(() => {
      // Ensure no commits are found for these tests
      octokit_listCommits_mock.mockResolvedValue({ data: [] })
      core_getInput_spy_mock.mockReturnValue('')
    })

    it('returns true for a first issue, even with a prior PR', async () => {
      octokit_issuesAndPullRequests_mock.mockReturnValue({ data: {items: [{}, { pull_request: {} }] }})

      await is_first_time_contributor(octokit, { ...default_opts, is_pull_request: false })

      expect(is_first_time_contributor_spy).toHaveResolvedWith(true)
    })

    it('returns false for a subsequent issue', async () => {
      octokit_issuesAndPullRequests_mock.mockReturnValue({ data: {items: [{}, {}] }})

      await is_first_time_contributor(octokit, { ...default_opts, is_pull_request: false })

      expect(is_first_time_contributor_spy).toHaveResolvedWith(false)
    })

    it('returns true for a first PR, even with a prior issue', async () => {
      octokit_issuesAndPullRequests_mock.mockReturnValue({ data: {items: [{ pull_request: {} }, {}] }})

      await is_first_time_contributor(octokit, { ...default_opts, is_pull_request: false })

      expect(is_first_time_contributor_spy).toHaveResolvedWith(true)
    })

    it('returns false for a subsequent PR', async () => {
      octokit_issuesAndPullRequests_mock.mockReturnValue({ data: {items: [{ pull_request: {} }, { pull_request: {} }] }})

      await is_first_time_contributor(octokit, { ...default_opts, is_pull_request: false })

      expect(is_first_time_contributor_spy).toHaveResolvedWith(false)
    })
  })
})
