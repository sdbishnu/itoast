import { execSync } from "node:child_process";

const commands = [
  ["Build", "npm run build"],
  ["Test", "npm test"]
];

for (const [name, command] of commands) {
  console.log(`\n[ITOAST] ${name}`);
  execSync(command, { stdio: "inherit", shell: true });
}

console.log("\n[ITOAST] Foundation validation passed.");