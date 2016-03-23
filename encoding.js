'use strict'
const path = require('path')
const cleanRE = /\W+/g
const extjson = '.json'

let clean = seg => {
  const extname = path.extname(seg);
  if (extname === extjson) {
    return seg.slice(0, -extjson.length).replace(cleanRE, '_');
  }
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

