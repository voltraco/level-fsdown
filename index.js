'use strict'
const util = require('util')
const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')
const AL = require('abstract-leveldown')
const ltgt = require('ltgt')
const AbstractLevelDown = AL.AbstractLevelDOWN
const AbstractIterator = AL.AbstractIterator

const encoding = require('./encoding')

function Fsdown (location) {
  AbstractLevelDown.call(this, location)
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

util.inherits(Fsdown, AbstractLevelDown)

Fsdown.prototype._open = function Open (options, cb) {

  options.keyEncoding = encoding

  let makeOpen = () => {
    mkdirp(this.location, (err) => {
      if (err) return cb(err)
      cb(null, this)
    })
  }

  if (options.createIfMissing) {
    makeOpen()
  } else if (options.errorIfExists) {
    fs.stat(this.location, (err) => {
      if (!err) return cb(new Error('Exists'))
      makeOpen()
    })
  }
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

function Iterator (db, options) {
  AbstractIterator.call(this, db)
  this._limit = options.limit

  if (this._limit === -1)
    this._limit = Infinity

  this._list = fs.readdirSync(db.location)
    .map((v) => path.join(db.location, v))

  let enc = options.valueEncoding
  ;['lt', 'lte', 'gt', 'gte'].map((v) => {
    let opt = options[v]
    if (opt) options[v] = path.basename(opt, '.' + enc)
  })

  this._reverse = options.reverse
  this._options = options
  this._done = 0
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype._next = function Next (cb) {
  let key = this._list[this._reverse ? 'pop' : 'shift']()
  if (!key) return cb(null)

  let enc = this._options.valueEncoding
  let k = path.basename(key, '.' + enc)

  if (this._done++ >= this._limit)
    return setImmediate(cb)

  if (!ltgt.contains(this._options, k)) this._next(cb)

  fs.readFile(key, { encoding: 'utf8' }, (err, val) => {
    if (err) return cb(err)
    cb(null, k, val)
  })
}

Iterator.prototype._end = function End (cb) {
  this._list.length = 0
  cb(null)
}

Fsdown.prototype._iterator = function (options) {
  return new Iterator(this, options)
}

module.exports = function (location) { 
  return new Fsdown(location) 
}

