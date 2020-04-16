
class Patterns {
  patterns = []

  /**
   * @param {string[]} p  Array of pattern strings
   */
  constructor(p) {
    for (const pattern of p) {
      this.patterns.push(new Pattern(pattern))
    }
  }

  /**
   * Tests whether the ref is a match
   * @param {string} str
   * @returns {boolean}
   */
  test(str) {
    let result = false
    for (const pattern of this.patterns) {
      result = pattern.test(str, result)
    }

    return result
  }
}

class Pattern {
  include = true
  regexp = undefined

  /**
   * @param {string} pattern 
   */
  constructor(pattern) {
    if (pattern.startsWith('-')) {
      this.include = false
      this.regexp = new RegExp(pattern.substr(1))
    }
    else if (pattern.startsWith('+')) {
      this.regexp = new RegExp(pattern.substr(1))
    }
    else {
      this.regexp = new RegExp(pattern)
    }
  }

  /**
   * @param {string} str      String to test
   * @param {boolean} status  Whether currently included or excluded
   */
  test(str, status) {
    if (this.include) {
      return status || this.regexp.test(str)
    }

    return status && !this.regexp.test(str)
  }
}
exports.Patterns = Patterns
