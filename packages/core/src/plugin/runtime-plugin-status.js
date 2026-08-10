export const RUNTIME_PLUGIN_STATUS = Object.freeze({
  ENABLED: "enabled",
  DISABLED: "disabled"
});

export function isValidPluginStatus(status) {
  return (
    status === RUNTIME_PLUGIN_STATUS.ENABLED ||
    status === RUNTIME_PLUGIN_STATUS.DISABLED
  );
}