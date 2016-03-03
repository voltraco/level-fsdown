'use strict'
const path = require('path')
const cleanRE = /\W+/g

let clean = seg => {
  return seg.replace(cleanRE, '_')
}

exports.encode = function(source) {
  if (Array.isArray(source)) {
    let key = source.slice().map(clean)
    key[key.length - 1] += '.json'
    return path.join.apply(null, key)
  }
  return clean(source) + '.json'
}

exports.decode = function (source) {
  return source.split(path.sep)
}

exports.buffer = false;
exports.type = 'fs';

