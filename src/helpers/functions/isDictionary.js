function isDictionary(data) {
    return typeof data === 'object' && data !== null && !Array.isArray(data);
  }
module.exports = isDictionary  