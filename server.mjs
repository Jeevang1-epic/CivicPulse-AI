import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";
const command = process.platform === "win32" ? "node_modules\\.bin\\next.cmd" : "node_modules/.bin/next";

const child = spawn(command, ["start", "-p", port], {
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
