export class RuntimeContext {
  constructor({} = {}) {
    this.values = new Map();
  }

  set(key, value) {
    this.values.set(key, value);
    return this;
  }

  get(key, defaultValue = undefined) {
    return this.values.has(key) ? this.values.get(key) : defaultValue;
  }

  has(key) {
    return this.values.has(key);
  }

  delete(key) {
    return this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }

  keys() {
    return [...this.values.keys()];
  }

  entries() {
    return [...this.values.entries()];
  }
}