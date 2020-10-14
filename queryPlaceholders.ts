interface ReplaceOptions {
  useNullForMissing: boolean;
}

interface MySqlQueryData<T, K extends keyof T> {
  sql: string;
  values: Array<T[K] | null>;
}

export const mySqlQueryBuilder = <T, K extends keyof T>(
  query: string,
  data?: T,
  options: ReplaceOptions = {useNullForMissing: true}
): MySqlQueryData<T, K> => {
  const values: Array<T[K] | null> = [];
  if (!data) {
    return {
      sql: query,
      values,
    };
  }
  return {
    sql: query.replace(/(::?)([a-zA-Z0-9_]+)/g, (_, prefix, key) => {
      if (key in data) {
        const value = (data as T)[key as K];
        values.push(value);
        return prefix.replace(/:/g, '?');
      } else if (options.useNullForMissing) {
        values.push(null);
        return prefix.replace(/:/g, '?');
      } else {
        return errorMissingValue(key, query, data);
      }
    }),
    values,
  };
};

const errorMissingValue = <T>(key: string, query: string, data: T) => {
  throw new Error(
    `Missing value for statement.
    ${key} not provided for statement:
    ${query}
    Data provided: ${JSON.stringify(data)}`
  );
};
