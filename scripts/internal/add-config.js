const config = require('./config')
const fsHelper = require('./fs-helper')

async function main() {
  try {
    const args = getArgs()
    const file = config.getFilePath(args.owner, args.repo)
    if (await fsHelper.exists(file)) {
      throw new Error(`File '${file}' already exists. Use 'update-config.sh' instead.`)
    }

    await config.add(args.owner, args.repo, args.patterns)
  }
  catch (err) {
    console.error(`ERROR: ${err.message}`)
    process.exitCode = 1
    // throw err
  }
}

class Args {
  owner = ''
  repo = ''
  patterns = []
}

/**
 * Get the command line args
 * @returns {Args}
 */
function getArgs() {
  if (process.argv.length < 3) {
    printUsage()
    throw new Error(`Expected at least one arg`)
  }

  const nwo = process.argv[2]
  const splitNwo = nwo.split('/')
  if (splitNwo.length !== 2 || !splitNwo[0] || !splitNwo[1]) {
    printUsage()
    throw new Error(`Invalid nwo '${nwo}'`)
  }

  return {
    owner: splitNwo[0],
    repo: splitNwo[1],
    patterns: process.argv.slice(3)
  }
}

function printUsage() {
  console.error('USAGE: add.sh nwo [(+|-)regexp [...]]')
  console.error(`  nwo     Name with owner. For example: actions/checkout`)
  console.error(`  regexp  Refs to include or exclude. Default: ${config.defaultPatterns.join(' ')}`)
  console.error('')
}

main()