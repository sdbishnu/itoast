function freezeObject(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Object.isFrozen(value)) {
    return value;
  }

  for (const key of Reflect.ownKeys(value)) {
    freezeObject(value[key]);
  }

  return Object.freeze(value);
}

export function createRuntimeOptions(options = {}) {
  if (
    options === null ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    throw new TypeError("Runtime options must be an object.");
  }

  return freezeObject({ ...options });
}
