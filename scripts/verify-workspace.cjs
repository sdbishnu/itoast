const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const workspaceDirectories = ["apps", "packages", "adapters", "plugins"];

let failed = false;

for (const directory of workspaceDirectories) {
  const workspacePath = path.join(root, directory);

  if (!fs.existsSync(workspacePath)) {
    console.error(`[FAIL] Missing workspace directory: ${directory}`);
    failed = true;
    continue;
  }

  console.log(`[OK] Workspace directory: ${directory}`);
}

const corePackage = path.join(root, "packages", "core", "package.json");

if (!fs.existsSync(corePackage)) {
  console.error("[FAIL] Missing @itoast/core package.json");
  failed = true;
} else {
  console.log("[OK] @itoast/core package.json");
}

if (failed) {
  process.exit(1);
}

console.log("ITOAST workspace verification passed.");