export class RuntimeError extends Error {
  constructor(message, code = "RUNTIME_ERROR", details = {}) {
    super(message);
    this.name = "RuntimeError";
    this.code = code;
    this.details = details;
  }
}
