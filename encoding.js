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
  var p = path.parse(source)
  var key = p.split(path.sep)
  key.push(p.name)
  return key
}

exports.buffer = false;
exports.type = 'fs';

