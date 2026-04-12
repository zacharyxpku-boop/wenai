import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const child = spawn(process.execPath, [path.join(root, "src", "server.mjs")], {
  cwd: root,
  detached: true,
  stdio: "ignore",
  windowsHide: true,
  env: process.env
});

child.unref();
console.log(child.pid);
