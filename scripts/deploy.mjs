import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(app, "dist");

execSync("npm run build", { cwd: app, stdio: "inherit" });
fs.writeFileSync(path.join(out, ".nojekyll"), "");

const remote = execFileSync("git", ["remote", "get-url", "origin"], { cwd: app }).toString().trim();
// Push with the gh login: the system credential manager may hold a different GitHub account.
const git = (...args) =>
  execFileSync("git", ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential", ...args], {
    cwd: out,
    stdio: "inherit",
  });

const tmpGit = path.join(out, ".git");
fs.rmSync(tmpGit, { recursive: true, force: true });
try {
  git("init", "-q");
  git("checkout", "-q", "-b", "gh-pages");
  git("add", "-A");
  git("commit", "-q", "-m", `Сайт ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
  git("push", "-q", "-f", remote, "gh-pages");
} finally {
  fs.rmSync(tmpGit, { recursive: true, force: true });
}

console.log(`\nВыложено: ${remote} → ветка gh-pages`);
