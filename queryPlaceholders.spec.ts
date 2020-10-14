/* eslint-disable node/no-unpublished-import */
import {mySqlQueryBuilder} from './queryPlaceholders';
import {assert} from 'chai';
import 'mocha';

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
  name: 'Ricardo',
  email: 'the_phantom_racer@hotmail.com',
};

describe('MySQL with nulls for missing option', () => {
  it('MySQL with nulls for missing', () => {
    const query =
      'SELECT * FROM users WHERE id = :id AND last_name = :lastName;';
    const queryData = mySqlQueryBuilder(query, user);
    assert.deepEqual(queryData, {
      sql: 'SELECT * FROM users WHERE id = ? AND last_name = ?;',
      values: [123, null],
    });
  });

  it('MySQL with insert and close by placeholders', () => {
    const query = 'INSERT INTO users (name, email) VALUES (:name, :email);';
    const queryData = mySqlQueryBuilder(query, user);
    assert.deepEqual(queryData, {
      sql: 'INSERT INTO users (name, email) VALUES (?, ?);',
      values: ['Ricardo', 'the_phantom_racer@hotmail.com'],
    });
  });
});

describe('MySQL without nulls for missing option', () => {
  it('Missing parameter error', () => {
    let errorMessage: string;
    try {
      const query = 'SELECT * FROM users WHERE username = :username;';
      mySqlQueryBuilder(query, user, {useNullForMissing: false});
    } catch (e) {
      errorMessage = e.message;
    }
    assert(
      errorMessage.startsWith('Missing value for statement.\n    username')
    );
  });
});
