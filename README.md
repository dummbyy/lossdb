# lossdb
Based in file, key-value database.

## Installation
``` shell
npm install lossdb
```

## Init. db

Specify file path, otherwise new file will be created automatically in current working directory

#### Insert data
```js
  db.insert("1", {"message": "Hello world!"}, 1000);
```
#### Delete data
```js
  db.delete("1");
```
#### Update date
```js
  db.update("1", {"message", "We're here!"});
```
#### Select data
```js
  db.select("1");
```
