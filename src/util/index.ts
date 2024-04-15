export type Brand<K, T> = K & { __brand: T };
export type ValueOf<T> = T[keyof T];

export const sleep = (time: number) =>
  new Promise((res) => window.setTimeout(res, time));

export const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const cloneInstance = <T>(instance: T) =>
  Object.assign(Object.create(Object.getPrototypeOf(instance)), instance) as T;
