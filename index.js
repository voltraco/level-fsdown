'use strict'
const util = require('util')
const fs = require('fs')
const path = require('path')
const enc = require('./encoding')

const mkdirp = require('mkdirp')
const Ald = require('abstract-leveldown').AbstractLevelDOWN

function Fsdown (location) {
  Ald.call(this, location)
}

function nextdir (dir) {
  dir = dir.split(path.sep)
  dir.pop()
  return dir.join(path.sep)
}

function cleandir (dir, location, cb) {
  if (!dir) return cb(null)
  if (dir == location) return cb(null)

  fs.rmdir(dir, (err) => {
    if (err && err.code !== 'ENOTEMPTY') return cb(err)
    else if (err) return cb(null)
    cleandir(nextdir(dir), location, cb)
  })
}

cleandir.sync = function(dir, location) {
  if (!dir) return
  if (dir == location) return

  try {
    fs.rmdirSync(dir)
  } catch(err) {
    if (err.code !== 'ENOTEMPTY') throw ex
  }
  cleandir.sync(nextdir(dir), location)
}

util.inherits(Fsdown, Ald)

Fsdown.prototype._open = function Open (options, cb) {
  
  process.nextTick(() => cb(null, this))
}

Fsdown.prototype._put = function Put (key, value, options, cb) {

  let k = path.parse(key)
  k.dir = path.join(this.location, k.dir)
  
  if (!cb) {
    mkdirp.sync(k.dir)
    return fs.writeFileSync(path.join(k.dir, k.base), value, options)
  }

  let write = (err) => {
    if (err) return cb(err)
    fs.writeFile(path.join(k.dir, k.base), value, options, cb)
  }

  if (k.dir) {
    mkdirp(k.dir, write)
  } else {
    write(null)
  }
}

Fsdown.prototype._get = function Get (key, options, cb) {

  key = path.join(this.location, key)

  if (!cb) return fs.readFileSync(key, options)
  fs.readFile(key, options, cb)
}

Fsdown.prototype._del = function Del (key, _, cb) {

  key = path.join(this.location, key)
  let dir = path.dirname(key)

  if (!cb) {
    fs.unlinkSync(key)
    cleandir.sync(dir, this.location)
    return
  }

  fs.unlink(key, (err) => {
    if (err) return cb(err)
    cleandir(dir, this.location, cb)
  })
}

// todo make atomic
Fsdown.prototype._batch = function Batch (arr, options, cb) {
  let counter = 0
  arr = arr.slice()

  let loop = (op, arr) => {
    if (!op) return cb(null)
    let next = (err) => {
      if (err) return cb(err)
      loop(arr.pop(), arr)
    }
    if (op.type == 'del') this.del(op.key, next)
    else this.put(op.key, op.value, op.options || {}, next)
  }

  loop(arr.pop(), arr)
}

module.exports = function (location) { 
  return new Fsdown(location) 
}

