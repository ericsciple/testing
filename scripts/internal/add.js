const exec = require('./exec')
const paths = require('./paths')

async function main() {
  try {
    await exec.exec('ls', [paths.temp])
    await exec.exec('ls', [paths.temp])
  }
  catch (err) {
    console.error(`ERROR: ${err.message}`)
    process.exitCode = 1
  }
}

main()