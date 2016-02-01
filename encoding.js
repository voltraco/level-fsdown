const path = require('path')

exports.encode = function (source) {
  if (Array.isArray(source)) {
    var key = source.slice()
    key[key.length - 1] += '.json'
    return path.join.apply(null, key)
  }
  return source + '.json'
}

exports.decode = function (source) {
  return source.split(path.sep)
}

exports.buffer = false;
exports.type = 'fs';

