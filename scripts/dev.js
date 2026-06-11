const { spawn } = require("child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const processes = [
  { name: "backend", args: ["run", "dev", "--workspace", "@foresight/backend"] },
  { name: "frontend", args: ["run", "dev", "--workspace", "frontend"] }
];

const children = processes.map((proc) => {
  const child = spawn(npmCommand, proc.args, {
    stdio: "inherit",
    shell: false
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${proc.name}] exited with code ${code}`);
      shutdown();
    }
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});
