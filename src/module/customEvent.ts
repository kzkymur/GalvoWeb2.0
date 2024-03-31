export const dispatch = <T = any>(eventName: string, detail: T) => {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
};

export const addCustomEventListener = <T = any>(
  eventName: string,
  listener: (arg: { detail: T }) => void
) => {
  window.addEventListener(eventName, listener as any);
};

export const removeCustomEventListener = <T = any>(
  eventName: string,
  listener: (arg: { detail: T }) => void
) => {
  window.removeEventListener(eventName, listener as any);
};

export const dealCustomEvent = <T = any>(
  eventName: string,
  listener: (arg: { detail: T }) => void
): [(detail: T) => void, () => void] => {
  const dispatcher = (detail: T) => dispatch(eventName, detail);

  addCustomEventListener(eventName, listener);
  const remover = () => removeCustomEventListener(eventName, listener);
  return [dispatcher, remover];
};
