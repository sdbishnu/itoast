export class RuntimeExtensions {
  constructor() {
    this.startupStages = [];
    this.shutdownStages = [];
  }

  addStartupStage(stage) {
    if (typeof stage !== "function") {
      throw new TypeError(
        "Startup extension must be a function."
      );
    }

    this.startupStages.push(stage);

    return stage;
  }

  addShutdownStage(stage) {
    if (typeof stage !== "function") {
      throw new TypeError(
        "Shutdown extension must be a function."
      );
    }

    this.shutdownStages.push(stage);

    return stage;
  }

  removeStartupStage(stage) {
    const index = this.startupStages.indexOf(stage);

    if (index === -1) {
      return false;
    }

    this.startupStages.splice(index, 1);

    return true;
  }

  removeShutdownStage(stage) {
    const index = this.shutdownStages.indexOf(stage);

    if (index === -1) {
      return false;
    }

    this.shutdownStages.splice(index, 1);

    return true;
  }

  clearStartupStages() {
    this.startupStages.length = 0;
  }

  clearShutdownStages() {
    this.shutdownStages.length = 0;
  }

  getStartupStages() {
    return [...this.startupStages];
  }

  getShutdownStages() {
    return [...this.shutdownStages];
  }
}