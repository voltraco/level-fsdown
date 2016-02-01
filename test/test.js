'use strict'

const levelup = require('levelup')
const Fsdb = require('../index')
const test = require('tape')
const rimraf = require('rimraf')

let db

test('create instance', assert => {

  rimraf.sync(__dirname + '/db')

  db = levelup(__dirname + '/db', {
    db: Fsdb,
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

test('del (deep directory)', assert => {

  let key = ['foo', 'bar', 'bazz', 'quxx'].join('/')
  db.put(key, {}, (err) => {
    assert.ok(!err)
    db.get(key, (err, _) => {
      assert.ok(!err)
      db.del(key, (err) => {
        assert.end()
      })
    })
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

test('createReadStream (no options)', assert => {

  let key1 = ['a']
  let key2 = ['b']
  let key3 = ['c']
  let key4 = ['d']
  let key5 = ['e']
  let key6 = ['f']
  let key7 = ['g']
  let key8 = ['h']

  db.batch([
    { type: 'put', key: key1, value: { num: 1 } },
    { type: 'put', key: key2, value: { num: 2 } },
    { type: 'put', key: key3, value: { num: 3 } },
    { type: 'put', key: key4, value: { num: 4 } },
    { type: 'put', key: key5, value: { num: 5 } },
    { type: 'put', key: key6, value: { num: 6 } },
    { type: 'put', key: key7, value: { num: 7 } },
    { type: 'put', key: key8, value: { num: 8 } }
  ], (err) => {
    assert.ok(!err)

    let readcount = 0
    let s = db.createReadStream()

    s.on('data', (data) => {
      ++readcount
      assert.equal(data.value.num, readcount)
    })
    s.on('end', () => {
      assert.equal(readcount, 8)
      assert.end()
    })
  })
})


test('createReadStream (options)', assert => {

  let key1 = ['a']
  let key2 = ['b']
  let key3 = ['c']
  let key4 = ['d']
  let key5 = ['e']
  let key6 = ['f']
  let key7 = ['g']
  let key8 = ['h']

  db.batch([
    { type: 'put', key: key1, value: { num: 1 } },
    { type: 'put', key: key2, value: { num: 2 } },
    { type: 'put', key: key3, value: { num: 3 } },
    { type: 'put', key: key4, value: { num: 4 } },
    { type: 'put', key: key5, value: { num: 5 } },
    { type: 'put', key: key6, value: { num: 6 } },
    { type: 'put', key: key7, value: { num: 7 } },
    { type: 'put', key: key8, value: { num: 8 } }
  ], (err) => {
    assert.ok(!err)

    let readcount = 0
    let s = db.createReadStream({ gte: 'c', lte: 'f' })

    s.on('data', (data) => {
      ++readcount
    })
    s.on('end', () => {
      assert.equal(readcount, 4)
      assert.end()
    })
  })
})

