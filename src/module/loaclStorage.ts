// localstorage = {
//   namespaces: ["namespaceName1", "namespaceName2", ...],
//   current-namespace: "namespaceName1",
//
//   namespaceName1: Object,
//   namespaceName2: Object,
//   ...
// }

import { dealCustomEvent, dispatch } from "./customEvent";

const PREFIX = "@galvoweb2.0://";

export const getKey = (key: string) => `${PREFIX}${key}`;

export const get = <T = any>(key: string): T | null => {
  const item = window.localStorage.getItem(getKey(key));
  if (item === undefined || item === null) return null;
  return JSON.parse(item) as T;
};

export const set = (key: string, value: any): void => {
  window.localStorage.setItem(getKey(key), JSON.stringify(value));
};

export const remove = (key: string): void => {
  window.localStorage.removeItem(getKey(key));
};

const NAMESPACES = "namespaces";

// export const getNamespaceKey = (namespaceName: string, key: string) =>
//   getKey(`${namespaceName}/${key}`);
export const getNamespaceKey = (namespaceName: string) =>
  getKey(`${namespaceName}`);

export const addNamespace = (namespaceName: string) => {
  const namespacesStr = get(NAMESPACES);
  let namespaces: string[] = [];
  if (namespacesStr !== null) {
    namespaces = namespacesStr;
  }
  set(NAMESPACES, [...namespaces, namespaceName]);
  set(getNamespaceKey(NAMESPACES), {});
};

export const removeNamespace = (namespaceName: string) => {
  const namespacesStr = get(NAMESPACES);
  let namespaces: string[] = [];
  if (namespacesStr !== null) {
    namespaces = namespacesStr;
  }
  if (!namespaces.includes(namespaceName)) {
    throw Error("namespaces name not found");
  }
  if (getCurrentNamespaceName() === namespaceName) {
    throw Error("this namespaceName is current selected");
  }
  remove(getKey(namespaceName));
  set(
    NAMESPACES,
    namespaces.filter((n) => n !== namespaceName)
  );
};

const CURRENT_NAMESPACE = "current-namespace";

export const getCurrentNamespaceName = () => get(CURRENT_NAMESPACE);
export const getCurrentNamespaceKey = () =>
  getNamespaceKey(getCurrentNamespaceName());

export const getCurrentNamespace = <T = any>(key?: string): T | null => {
  if (key !== undefined) {
    return (get(getCurrentNamespaceKey()) || {})[key];
  }
  return get(getCurrentNamespaceKey());
};

export const setCurrentNamespaceName = (namespaceName: string) => {
  const namespacesStr = get(NAMESPACES);
  let namespaces: string[] = [];
  if (namespacesStr !== null) {
    namespaces = namespacesStr;
  }
  if (!namespaces.includes(namespaceName)) {
    throw Error("namespaces name not found");
  }
  set(getKey(CURRENT_NAMESPACE), namespaceName);
};

export const setCurrentNamespaceObj = (value: any) => {
  set(getCurrentNamespaceKey(), value);
};
export const setCurrentNamespace = (key: string, value: any) => {
  set(getCurrentNamespaceKey(), {
    ...getCurrentNamespace(),
    [key]: value,
  });
};
export const removeCurrentNamespace = (key: string) => {
  const cn = {
    ...getCurrentNamespace(),
  };
  delete cn[key];
  set(getCurrentNamespaceKey(), cn);
};

const UPDATE_EVENT_NAME = "store-updated";

type Detail = string;

const StoreListenerController = () => {
  let listners: { key: string; callback: (arg: any) => void }[] = [];

  const rootListener = ({ detail }: { detail: string }) => {
    listners.forEach(({ key, callback }) => {
      if (key !== detail) return;
      let value = get(key);
      if (value === null) return;
      callback(value);
    });
  };
  dealCustomEvent<Detail>(UPDATE_EVENT_NAME, rootListener);

  const addStoreListener = (key: string, callback: (args: any) => void) => {
    listners = [...listners, { key, callback }];
  };
  const removeStoreListener = (
    _key: string,
    _callback: (args: any) => void
  ) => {
    listners = listners.filter(
      ({ key, callback }) => key !== _key || callback !== _callback
    );
  };

  return { addStoreListener, removeStoreListener };
};

export const { addStoreListener, removeStoreListener } =
  StoreListenerController();
export const updateStore = <T = any>(key: string, value: T) => {
  set(key, value);
  dispatch<Detail>(UPDATE_EVENT_NAME, key);
};
export const deleteStore = (key: string) => {
  remove(key);
  dispatch<Detail>(UPDATE_EVENT_NAME, key);
};

const NamespacedStoreListenerController = () => {
  let listners: { key: string; callback: (arg: any) => void }[] = [];

  const rootListener = ({ detail }: { detail: string }) => {
    listners.forEach(({ key, callback }) => {
      if (key !== detail) return;
      const currentObj = getCurrentNamespace();
      if (currentObj === null) return;
      callback(currentObj[key]);
    });
  };
  dealCustomEvent<Detail>(UPDATE_EVENT_NAME, rootListener);

  const addNamespacedStoreListener = (
    key: string,
    callback: (args: any) => void
  ) => {
    listners = [...listners, { key, callback }];
  };
  const removeNamespacedStoreListener = (
    _key: string,
    _callback: (args: any) => void
  ) => {
    listners = listners.filter(
      ({ key, callback }) => key !== _key || callback !== _callback
    );
  };

  return { addNamespacedStoreListener, removeNamespacedStoreListener };
};

export const { addNamespacedStoreListener, removeNamespacedStoreListener } =
  NamespacedStoreListenerController();
export const updateNamespacedStore = <T = any>(key: string, value: T) => {
  setCurrentNamespace(key, value);
  dispatch<Detail>(UPDATE_EVENT_NAME, key);
};
export const deleteNamespacedStore = (key: string) => {
  removeCurrentNamespace(key);
  dispatch<Detail>(UPDATE_EVENT_NAME, key);
};
