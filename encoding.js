const path = require('path')
const dotRE = /\./g

exports.encode = function (source) {
  if (Array.isArray(source)) {
    var key = source.slice()
    key.map(seg => seg.replace(dotRE, ''))
    key[key.length - 1] += '.json'
    return path.join.apply(null, key)
  }
  return source.replace(dotRE, '') + '.json'
}

exports.decode = function (source) {
  return source.split(path.sep)
}

exports.buffer = false;
exports.type = 'fs';

