const exec = require('./exec')
const fs = require('fs')
const path = require('path')
const paths = require('./paths')
const Patterns = require('./patterns').Patterns

const defaultPatterns = ['+^master$', '+^v[0-9]']

async function main() {
  try {
    if (process.argv.length < 4) {
      printUsage()
      throw new Error(`Expected at least two args`)
    }

    const owner = process.argv[2]
    const repo = process.argv[3]
    const patternStrings = process.argv.length < 5 ? defaultPatterns : process.argv.slice(4)
    const patterns = new Patterns(patternStrings)

    const file = path.join(paths.config, `${owner}_${repo}.json`)
    await checkFile(file)
    const content = {
      owner: owner,
      repo: repo,
      patterns: patternStrings,
      branches: {},
      tags: {}
    }

    // await exec.exec('rm', ['-rf', paths.temp])
    await exec.exec('mkdir', ['-p', paths.temp])
    process.chdir(paths.temp)
    await exec.exec('pwd')
    await exec.exec('git', ['--version'])
    // await exec.exec('git', ['init'])
    // await exec.exec('git', ['remote', 'add', 'origin', `https://github.com/${owner}/${repo}.git`])
    // await exec.exec('git', ['fetch', '--tags'])

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
  catch (err) {
    console.error(`ERROR: ${err.message}`)
    process.exitCode = 1
    // throw err
  }
}

/**
 * Verifies the config file does not exist
 * @returns {Promise} 
 */
async function checkFile(file) {
  try {
    await fs.promises.stat(file)
    printUsage()
    throw new Error(`File '${file}' already exists. Use 'update.sh' instead.`)
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      return
    }

    throw err
  }
}

/**
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
 * @returns {Promise<string[]>}
 */
async function getTags() {
  const execResult = await exec.exec('git', ['tag', '--list'])
  return execResult.stdout.trim().split('\n')
}

/**
 * @param {string} ref
 * @returns {Promise<string>}
 */
async function getCommitSha(ref) {
  const execResult = await exec.exec('git', ['log', '-1', '--format=format:%H%n', ref])
  return execResult.stdout.trim()
}

/**
 * @param {string} ref 
 * @returns {Promise<string>}
 */
async function getSha(ref, commitSha) {
  const execResult = await exec.exec('git', ['rev-parse', ref])
  return execResult.stdout.trim()
}

function printUsage() {
  console.error('USAGE: add.sh owner repo [(+|-)regexp [...]]')
  console.error(`  regexp  Refs to include or exclude. Default: ${defaultPatterns.join(' ')}`)
  console.error('')
}

main()