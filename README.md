# SYNOPSIS
A [`levelup`][0] compatible [`abstraction`][1] for node's [`fs`][2]
module to use the file system as a backing store.

# USAGE
```js
const Fsdown = require('level-fsdown')
const encoding = require('level-fsdown/encoding')

let db = levelup(__dirname, {
  db: Fsdown,
  keyEncoding: encoding,
  valueEncoding: 'json'
})


db.put(['foo', 'bar'], { hello: 'world' }, function (err) {
  if (err) throw err

  // a file containing the json `{ hello: 'world' }` was
  // written to the location `__dirname/foo/bar.json`.

  db.get(['foo', 'bar'], function (err, value) {
    if (err) throw err
    console.log(value)
  })
})
```

[0]:https://github.com/level/levelup
[1]:https://github.com/level/leveldown
[2]:https://nodejs.org/api/fs.html

