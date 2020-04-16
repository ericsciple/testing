const exec = require('./exec')
const fs = require('fs')
const path = require('path')
const paths = require('./paths')
const Patterns = require('./patterns').Patterns

const defaultPatterns = ['+^master$', '+^v[0-9]+(\\.[0-9]+){0,2}$']
exports.defaultPatterns = defaultPatterns

/**
 * Returns the config file path
 * @param {string} owner 
 * @param {string} repo 
 * @returns {string}
 */

function getFilePath(owner, repo) {
  if (!owner) {
    throw new Error("Arg 'owner' must not be empty")
  }

  if (!repo) {
    throw new Error("Arg 'repo' must not be empty")
  }

  return path.join(paths.config, `${owner}_${repo}.json`)
}
exports.getFilePath = getFilePath

/**
 * Adds a new config file
 * @param {string} owner
 * @param {string} repos
 * @param {string[]} patternStrings
 * @returns {Promise}
 */
async function add(owner, repo, patternStrings) {
  if (!owner) {
    throw new Error("Arg 'owner' must not be empty")
  }

  if (!repo) {
    throw new Error("Arg 'repo' must not be empty")
  }

  if (!patternStrings) {
    throw new Error("Arg 'patternStrings' must not be null")
  }

  if (patternStrings.length === 0) {
    patternStrings = defaultPatterns
  }

  const patterns = new Patterns(patternStrings)
  const file = getFilePath(owner, repo)
  const content = {
    owner: owner,
    repo: repo,
    patterns: patternStrings,
    branches: {},
    tags: {}
  }

  await exec.exec('rm', ['-rf', paths.temp])
  await exec.exec('mkdir', ['-p', paths.temp])
  const originalCwd = process.cwd()
  try {
    process.chdir(paths.temp)
    await exec.exec('pwd')
    await exec.exec('git', ['--version'])
    await exec.exec('git', ['init'])
    await exec.exec('git', ['remote', 'add', 'origin', `https://github.com/${owner}/${repo}.git`])
    await exec.exec('git', ['fetch', '--tags'])

    let branches = await getBranches()
    branches = branches.filter(x => patterns.test(x))
    for (const branch of branches) {
      content.branches[branch] = await getCommitSha(`refs/remotes/origin/${branch}`)
    }

    let tags = await getTags()
    tags = tags.filter(x => patterns.test(x))
    for (const tag of tags) {
      const qualifiedRef = `refs/tags/${tag}`
      const commitSha = await getCommitSha(qualifiedRef)
      content.tags[tag] = {
        commit: commitSha
      }
      const tagSha = await getSha(qualifiedRef)
      if (tagSha !== commitSha) {
        content.tags[tag].tag = tagSha
      }
    }

    await fs.promises.writeFile(file, JSON.stringify(content, null, '  '))
  }
  finally {
    process.chdir(originalCwd)
  }
}
exports.add = add

/**
 * Returns a list of branches. For example: ["master"]
 * @returns {Promise<string[]>}
 */
async function getBranches() {
  const result = []

  // Note, this implementation uses "rev-parse --symbolic-full-name" because:
  // - The output from "branch --list" is difficult when in a detached HEAD state.
  // - There is a bug in Git 2.18 that causes "rev-parse --symbolic" to output symbolic full names.
  const execResult = await exec.exec('git', ['rev-parse', '--symbolic-full-name', '--remotes=origin'])
  for (let ref of execResult.stdout.trim().split('\n')) {
    ref = ref.trim()
    if (!ref) {
      continue
    }

    const prefix = 'refs/remotes/origin/'
    if (!ref.startsWith(prefix) || ref.length === prefix.length) {
      throw new Error(`Unexpected branch format '${ref}'`)
    }

    ref = ref.substr(prefix.length)
    result.push(ref)
  }

  return result
}

/**
 * Returns a list of tags. For example: ["v1", "v2"]
 * @returns {Promise<string[]>}
 */
async function getTags() {
  const execResult = await exec.exec('git', ['tag', '--list'])
  return execResult.stdout.trim().split('\n')
}

/**
 * Resolves a ref to a commit SHA
 * @param {string} ref
 * @returns {Promise<string>}
 */
async function getCommitSha(ref) {
  const execResult = await exec.exec('git', ['log', '-1', '--format=format:%H%n', ref])
  return execResult.stdout.trim()
}

/**
 * Resolves a ref to a SHA. For a branch or lightweight tag, the commit SHA is returned.
 * For an annotated tag, the tag SHA is returned.
 * @param {string} ref 
 * @returns {Promise<string>}
 */
async function getSha(ref, commitSha) {
  const execResult = await exec.exec('git', ['rev-parse', ref])
  return execResult.stdout.trim()
}
