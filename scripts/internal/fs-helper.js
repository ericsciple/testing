const fs = require('fs')

/**
 * Checks whether a path exists
 * @param {string} p  File or directory path
 * @returns {Promise<boolean>}
 */
async function exists(p) {
  try {
    await fs.promises.stat(p)
    return true
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }

    throw err
  }
}
exports.exists = exists
