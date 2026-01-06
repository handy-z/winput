#!/usr/bin/env bun

/**
 * Monorepo Release Script
 * Publishes @winput/* packages to npm
 *
 * Usage:
 *   bun run release [patch|minor|major] [--dry-run]
 */

import { createSpinner } from "nanospinner";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  readdirSync,
} from "fs";
import { join } from "path";

type BumpType = "patch" | "minor" | "major";

const PROJECT_ROOT = join(import.meta.dir, "..");
const PACKAGES_DIR = join(PROJECT_ROOT, "packages");
const PUBLISH_ORDER = [
  "utils",
  "image",
  "screen",
  "keyboard",
  "mouse",
  "window",
  "overlay",
  "winput",
];

const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  bgGreen: "\x1b[42m",
  white: "\x1b[37m",
};

interface PackageInfo {
  name: string;
  dir: string;
  version: string;
  originalVersion: string;
  npmVersion: string | null;
  needsPublish: boolean;
}

function readPkg(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writePkg(path: string, pkg: Record<string, unknown>): void {
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
}

function bump(version: string, type: BumpType): string {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

async function exec(cmd: string, args: string[], cwd = PROJECT_ROOT) {
  const proc = Bun.spawn([cmd, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  return { ok: (await proc.exited) === 0, out: out + err };
}

async function getNpmVersion(name: string): Promise<string | null> {
  const { ok, out } = await exec("npm", ["view", name, "version", "--json"]);
  if (!ok) return null;
  try {
    return JSON.parse(out.trim());
  } catch {
    return out.trim() || null;
  }
}

function getNewestTime(dir: string): number {
  if (!existsSync(dir)) return 0;
  let newest = 0;

  function scan(path: string) {
    const entries = readdirSync(path, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(path, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "dist") {
          scan(fullPath);
        }
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const mtime = statSync(fullPath).mtimeMs;
        if (mtime > newest) newest = mtime;
      }
    }
  }

  scan(dir);
  return newest;
}

function getDistTime(pkgDir: string): number {
  const distPath = join(pkgDir, "dist", "index.js");
  if (!existsSync(distPath)) return 0;
  return statSync(distPath).mtimeMs;
}

function hasCodeChanges(pkgDir: string): boolean {
  const srcDir = join(pkgDir, "src");
  const srcTime = getNewestTime(srcDir);
  const distTime = getDistTime(pkgDir);
  return srcTime > distTime;
}

async function getPackages(): Promise<PackageInfo[]> {
  const spinner = createSpinner("Checking packages").start();

  const packages = await Promise.all(
    PUBLISH_ORDER.map(async (dir) => {
      const pkgPath = join(PACKAGES_DIR, dir, "package.json");
      if (!existsSync(pkgPath)) return null;

      const pkgDir = join(PACKAGES_DIR, dir);
      const pkg = readPkg(pkgPath);
      const name = pkg.name as string;
      const version = pkg.version as string;
      const npmVersion = await getNpmVersion(name);
      const codeChanged = hasCodeChanges(pkgDir);

      const needsPublish = !npmVersion || version > npmVersion || codeChanged;

      return {
        name,
        dir,
        version,
        originalVersion: version,
        npmVersion,
        needsPublish,
      };
    })
  );

  spinner.success({ text: "Checked packages" });
  return packages.filter((p): p is PackageInfo => p !== null);
}

async function buildPackages(packages: PackageInfo[]): Promise<boolean> {
  const toBuild = packages.filter((p) => p.needsPublish);
  if (toBuild.length === 0) return true;

  console.log(`\n${c.yellow}Building ${toBuild.length} package(s):${c.reset}\n`);

  for (const pkg of packages) {
    if (!pkg.needsPublish) {
      console.log(`${c.gray}○ ${pkg.name} (up to date)${c.reset}`);
      continue;
    }

    const spinner = createSpinner(`Building ${pkg.name}`).start();
    const pkgDir = join(PACKAGES_DIR, pkg.dir);

    const cleanResult = await exec("bun", ["run", "clean"], pkgDir);
    if (!cleanResult.ok) {
      spinner.error({ text: `${pkg.name} clean failed` });
      return false;
    }

    const buildResult = await exec("bun", ["run", "build"], pkgDir);
    if (!buildResult.ok) {
      spinner.error({ text: `${pkg.name} build failed` });
      return false;
    }

    spinner.success({ text: pkg.name });
  }

  return true;
}

async function publish(pkg: PackageInfo, dryRun: boolean): Promise<boolean> {
  if (!pkg.needsPublish) {
    console.log(`${c.gray}○ ${pkg.name}@${pkg.version} (up to date)${c.reset}`);
    return true;
  }

  const spinner = createSpinner(
    `Publishing ${pkg.name}@${pkg.version}`
  ).start();

  if (dryRun) {
    spinner.success({ text: `${pkg.name}@${pkg.version} (dry run)` });
    return true;
  }

  const { ok, out } = await exec(
    "npm",
    ["publish", "--access", "public"],
    join(PACKAGES_DIR, pkg.dir)
  );

  if (ok) {
    spinner.success({ text: `${pkg.name}@${pkg.version}` });
  } else {
    spinner.error({ text: `${pkg.name} failed` });
    if (out.includes("cannot be republished")) {
      console.log(`${c.gray}  ↳ npm lockout (24h wait)${c.reset}`);
    }
  }

  return ok;
}

async function commitAndPush(version: string): Promise<void> {
  const spinner = createSpinner("Committing changes").start();

  await exec("git", ["add", "-A"]);
  const commit = await exec("git", ["commit", "-m", `release: v${version}`]);

  if (!commit.ok) {
    spinner.warn({ text: "Nothing to commit" });
    return;
  }

  const push = await exec("git", ["push", "origin", "main"]);
  if (push.ok) {
    spinner.success({ text: `Pushed v${version}` });

    await exec("git", ["tag", `v${version}`]);
    await exec("git", ["push", "origin", `v${version}`]);
    console.log(`${c.green}✓ Tagged v${version}${c.reset}`);
  } else {
    spinner.warn({ text: "Push failed" });
  }
}

async function release() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const bumpType = args
    .map((a) => a.replace(/^--/, ""))
    .find((a) => ["patch", "minor", "major"].includes(a)) as
    | BumpType
    | undefined;

  console.log(`${c.bright}${c.cyan}╭────────────────────────╮${c.reset}`);
  console.log(`${c.bright}${c.cyan}│   @winput/* Release    │${c.reset}`);
  console.log(`${c.bright}${c.cyan}╰────────────────────────╯${c.reset}\n`);

  const packages = await getPackages();

  if (bumpType) {
    console.log(`\n${c.yellow}Bumping versions (${bumpType}):${c.reset}\n`);

    for (const pkg of packages) {
      if (!pkg.needsPublish) {
        console.log(
          `${c.gray}○ ${pkg.name}@${pkg.version} (up to date)${c.reset}`
        );
        continue;
      }

      const pkgPath = join(PACKAGES_DIR, pkg.dir, "package.json");
      const pkgJson = readPkg(pkgPath);
      const newVersion = bump(pkg.version, bumpType);
      pkgJson.version = newVersion;
      writePkg(pkgPath, pkgJson);
      pkg.version = newVersion;
      pkg.needsPublish = true;

      console.log(
        `${c.cyan}● ${pkg.name}${c.reset} → ${c.green}${newVersion}${c.reset}`
      );
    }
  }

  const toPublish = packages.filter((p) => p.needsPublish);

  if (toPublish.length === 0) {
    console.log(`\n${c.yellow}All packages are up to date.${c.reset}\n`);
    return;
  }

  const buildOk = await buildPackages(packages);
  if (!buildOk) {
    console.log(`\n${c.brightRed}✗ Build failed${c.reset}\n`);
    process.exit(1);
  }

  console.log(
    `\n${c.bright}Publishing ${toPublish.length} package(s):${c.reset}\n`
  );

  let failed = 0;
  let succeeded = 0;
  for (const pkg of packages) {
    const ok = await publish(pkg, dryRun);
    if (!ok) failed++;
    else if (pkg.needsPublish) succeeded++;
  }

  const winputPkg = packages.find((p) => p.dir === "winput");
  const version = winputPkg?.version || "latest";

  if (bumpType && !dryRun && succeeded > 0) {
    console.log();
    await commitAndPush(version);
  }

  console.log();
  if (failed === 0) {
    console.log(
      `${c.bright}${c.bgGreen}${c.white} ✨ All packages published! ${c.reset}\n`
    );
  } else {
    console.log(`${c.brightRed}✗ ${failed} package(s) failed${c.reset}\n`);
    process.exit(1);
  }
}

release();
