interface ReplaceOptions {
  useNullForMissing: boolean;
}

interface MySqlQueryData<T, K extends keyof T> {
  sql: string;
  values: Array<T[K] | null>;
}

export const queryBuilder = <T, K extends keyof T>(
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
    sql: query.replace(/(::?)([\w.]+)(\.?)/g, (_, prefix, key) => {
      const value: T[K] | undefined = getObjectValue(data, key);
      if (value) {
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

const getObjectValue = <T, K extends keyof T>(
  object: T,
  keyName: string
): T[K] | undefined => {
  const keys = keyName.split('.');
  if (keys.length === 1) {
    if (typeof object === 'object') {
      if (keys[0] in (object as T)) {
        return (object as T)[keys[0] as K];
      }
      return undefined;
    }
    return undefined;
  } else {
    const [parentKey, ...restElements] = keys;
    if (!object) return undefined;
    return (getObjectValue(
      (object as T)[parentKey as K],
      restElements.join('.')
    ) as unknown) as T[K];
  }
};

const errorMissingValue = <T>(key: string, query: string, data: T) => {
  throw new Error(
    `Missing value for statement.
    ${key} not provided for statement:
    ${query}
    Data provided: ${JSON.stringify(data)}`
  );
};
