'use strict'

const levelup = require('levelup')
const Fsdb = require('../index')
const encoding = require('../encoding')
const test = require('tape')

let db

test('create instance', assert => {

  db = levelup(__dirname, {
    db: Fsdb,
    keyEncoding: encoding,
    valueEncoding: 'json'
  })

  assert.ok(db)
  assert.ok(db.location)
  assert.end()
})

test('put and get (shallow no directory)', assert => {

  let expected = { bar: 'quxx', bazz: 100 }
  let key = ['foo']

  db.put(key, expected, (err) => {
    if (err) throw err
    db.get(key, (err, actual) => {
      assert.ok(!err)
      assert.deepEqual(expected, actual)
      assert.end()
    })
  })
})

test('put and get (shallow directory)', assert => {

  let expected = { bar: 'quxx', bazz: 100 }
  let key = ['foo', 'bar']

  db.put(key, expected, (err) => {
    if (err) throw err
    db.get(key, (err, actual) => {
      assert.ok(!err)
      assert.deepEqual(expected, actual)
      assert.end()
    })
  })
})

test('put and get (deep directory)', assert => {

  let expected = { bar: 'quxx', bazz: 100 }
  let key = ['foo', 'bar', 'bazz', 'quxx']

  db.put(key, expected, (err) => {
    if (err) throw err
    db.get(key, (err, actual) => {
      assert.ok(!err)
      assert.deepEqual(expected, actual)
      assert.end()
    })
  })
})

test('get without put', assert => {

  let expected = { bar: 'quxx', bazz: 100 }

  db.get(['foo', 'bar'], (err, actual) => {
    if (err) throw err
    assert.deepEqual(expected, actual)
    assert.end()
  })
})

test('del (shallow no directory)', assert => {

  let key = ['foo']
  db.del(key, (err) => {
    assert.ok(!err)
    assert.end()
  })
})

test('del fail (shallow no directory)', assert => {

  let key = ['foo']
  db.del(key, (err) => {
    assert.ok(err)
    assert.end()
  })
})

test('del (shallow directory)', assert => {

  let key = ['foo', 'bar']
  db.del(key, (err) => {
    assert.ok(!err)
    assert.end()
  })
})

test('del (deep directory)', assert => {

  let key = ['foo', 'bar', 'bazz', 'quxx']
  db.del(key, (err) => {
    assert.ok(!err)
    assert.end()
  })
})

test('batch', assert => {

  let key1 = ['foo']
  let key2 = ['foo', 'bar', 'bazz', 'quxx']

  let val1 = { now: +Date.now() }
  let val2 = { now: +Date.now() }

  db.batch([
    { type: 'put', key: key1, value: val1 },
    { type: 'put', key: key2, value: val2 }
  ], (err) => {
    assert.ok(!err)

    db.get(key1, (err, actual) => {
      assert.ok(!err)
      console.log(err, actual)
      assert.deepEqual(actual, val1)

      db.get(key2, (err, actual) => {
        assert.ok(!err)
        assert.deepEqual(actual, val2)

          db.batch([
            { type: 'del', key: key1 },
            { type: 'del', key: key2 }
          ], (err) => {
            assert.ok(!err)
            assert.end()
          })
      })
    })

  })
})

