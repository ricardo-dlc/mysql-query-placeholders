[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts) [![Node.js Package](https://github.com/ricardo-dlc/mysql-query-placeholders/workflows/Node.js%20Package/badge.svg)](https://www.npmjs.com/package/mysql-query-placeholders)

# mysql-query-placeholders

### Build prepared statements from named parameters.
Consider the following object:

```javascript
const user = {
  id: 123,
  status: {
    active: true,
  },
  services: {
    home: {
      route: '/',
    },
    dashboard: {
      route: '/dashboard',
    },
  },
  name: 'John',
  email: 'email@mail.com',
};
```

Then you can easily create a prepared statement for MySQL using the data from the object above.

```javascript
const mqp = require('mysql-query-placeholders');
const mysql = require('mysql2').createConnection...

const query = 'SELECT * FROM users WHERE id = :id AND name = :name;';
const queryData = mqp.queryBuilder(query, user);
console.log(queryData);
// {
//   sql: 'SELECT * FROM users WHERE id = ? AND name = ?;',
//   values: [123, 'John'],
// }

// use named parameters
mysql.query(queryData, (err, result) => {...});
```

### ES6 Module

```typescript
import {queryBuilder} from 'mysql-query-placeholders';
import {createConnection} from 'mysql2/promise';

const mysql = createConnection(...);

const query = 'SELECT * FROM users WHERE id = :id AND name = :name;';
const queryData = queryBuilder(query, user);
console.log(queryData);
// {
//   sql: 'SELECT * FROM users WHERE id = ? AND name = ?;',
//   values: [123, 'John'],
// }

// use named parameters
await mysql.query(queryData);
```

## Handling missing parameters
MySQL throws an error if a parameter is not given.
Passing a configuration object with `useNullForMissing` set to true (which is `true` by default), a `null` value is used instead.
```javascript
const query = 'SELECT * FROM users WHERE id = :id AND last_name = :last_name;';
const queryData = mqp.queryBuilder(query, user, {useNullForMissing: true});
console.log(queryData);
// {
//   sql: 'SELECT * FROM users WHERE id = ? AND last_name = ?;',
//   values: [123, null],
// }
```

If you do not want to use `null` by default, you can throw an error instead, setting the `useNullForMissing` configuration option to `false`.

```javascript
try {
  const query = 'SELECT * FROM users WHERE id = :id AND last_name = :last_name;';
  const queryData = mqp.queryBuilder(query, user, {useNullForMissing: false});
} catch (e) {
  errorMessage = e.message;
  console.log(errorMessage);
  // Missing value for statement.
  //   last_name not provided for statement:
  //   ...
}
```
## Support for multiple level object property values
mqp is capable to get a object property value from a key.name.property.value syntax.
This is useful when you do not want to reassign the property value to another variable or you want to use the original object instead of creating a new one.
```javascript
const query = 'SELECT * FROM services WHERE route IN (:services.dashboard.route, :services.home.route);';
const queryData = mqp.queryBuilder(query, user);
console.log(queryData);
// {
//   sql: 'SELECT * FROM services WHERE route IN (?, ?);',
//   values: [ '/dashboard', '/' ]
// }
```

Missing property:
```javascript
const query = 'INSERT INTO services (name, route) VALUES (\'cpanel\', :services.cpanel.route);';
const queryData = mqp.queryBuilder(query, user);
console.log(queryData);
// {
//   sql: "INSERT INTO services (name, route) VALUES ('cpanel', ?);",
//   values: [ null ]
// }
```

Or using `{useNullForMissing: false}` config:
```javascript
try {
  const query = 'SELECT * FROM services WHERE route = :services.cpanel.route;';
  const queryData = mqp.queryBuilder(query, user, {useNullForMissing: false});
} catch (e) {
  errorMessage = e.message;
  console.log(errorMessage);
  //  Missing value for statement.
  //    services.cpanel.route not provided for statement:
  //    ...
}
```