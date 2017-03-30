export function identity(x) {
  return x;
}
export const tag = proto =>
  data => {
    const result = Object.create(proto);
    Object.assign(result, data);
    return result;
  };
export function noop() {}
export function isPromise(p) {
  return p && Promise.resolve(p) === p;
}
