# lossdb
Based in file, key-value database.

## Installation
``` shell
npm install lossdb
```

## Init. db

Specify file path, otherwise new file will be created automatically in current working directory

#### Usage
```js
  // Insert data
  // 1000 is expire time in seconds.
  db.insert("1", {"message": "Hello world!"}, 1000);
  
  // Delete data
  db.delete("1");
  
  // Update data
   db.update("1", {"message", "We're here!"});
   
  // Select data
  db.select("1");
```
