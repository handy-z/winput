#!/usr/bin/env bun

/**
 * Incremental Build Script
 * Only builds packages with source file changes
 *
 * Usage:
 *   bun run scripts/build.ts [--force]
 */

import { createSpinner } from "nanospinner";
import { existsSync, statSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = join(import.meta.dir, "..");
const PACKAGES_DIR = join(PROJECT_ROOT, "packages");
const BUILD_ORDER = [
  "utils",
  "screen",
  "image",
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
};

async function exec(cmd: string, args: string[], cwd: string) {
  const proc = Bun.spawn([cmd, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  return { ok: (await proc.exited) === 0, out: out + err };
}

function getNewestTime(dir: string, extensions: string[]): number {
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
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        const mtime = statSync(fullPath).mtimeMs;
        if (mtime > newest) newest = mtime;
      }
    }
  }
  
  scan(dir);
  return newest;
}

function getDistTime(dir: string): number {
  const distPath = join(dir, "dist", "index.js");
  if (!existsSync(distPath)) return 0;
  return statSync(distPath).mtimeMs;
}

interface PackageBuildInfo {
  name: string;
  dir: string;
  srcTime: number;
  distTime: number;
  needsBuild: boolean;
}

async function getPackages(force: boolean): Promise<PackageBuildInfo[]> {
  const packages: PackageBuildInfo[] = [];
  
  for (const dir of BUILD_ORDER) {
    const pkgDir = join(PACKAGES_DIR, dir);
    const pkgJsonPath = join(pkgDir, "package.json");
    
    if (!existsSync(pkgJsonPath)) continue;
    
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
    const srcDir = join(pkgDir, "src");
    
    const srcTime = getNewestTime(srcDir, [".ts", ".tsx"]);
    const distTime = getDistTime(pkgDir);
    
    packages.push({
      name: pkg.name,
      dir,
      srcTime,
      distTime,
      needsBuild: force || srcTime > distTime,
    });
  }
  
  return packages;
}

async function buildPackage(pkg: PackageBuildInfo): Promise<boolean> {
  const pkgDir = join(PACKAGES_DIR, pkg.dir);
  
  const cleanResult = await exec("bun", ["run", "clean"], pkgDir);
  if (!cleanResult.ok) return false;
  
  const buildResult = await exec("bun", ["run", "build"], pkgDir);
  return buildResult.ok;
}

async function build() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  console.log(`${c.bright}${c.cyan}╭────────────────────────╮${c.reset}`);
  console.log(`${c.bright}${c.cyan}│   @winput/* Build      │${c.reset}`);
  console.log(`${c.bright}${c.cyan}╰────────────────────────╯${c.reset}\n`);

  const packages = await getPackages(force);
  const toBuild = packages.filter(p => p.needsBuild);
  
  if (toBuild.length === 0) {
    console.log(`${c.green}✓ All packages up to date${c.reset}\n`);
    return;
  }

  console.log(`${c.yellow}Building ${toBuild.length}/${packages.length} package(s):${c.reset}\n`);

  let failed = 0;
  
  for (const pkg of packages) {
    if (!pkg.needsBuild) {
      console.log(`${c.gray}○ ${pkg.name} (up to date)${c.reset}`);
      continue;
    }
    
    const spinner = createSpinner(`Building ${pkg.name}`).start();
    const ok = await buildPackage(pkg);
    
    if (ok) {
      spinner.success({ text: pkg.name });
    } else {
      spinner.error({ text: `${pkg.name} failed` });
      failed++;
    }
  }

  console.log();
  if (failed === 0) {
    console.log(`${c.green}✓ Build complete${c.reset}\n`);
  } else {
    console.log(`${c.brightRed}✗ ${failed} package(s) failed${c.reset}\n`);
    process.exit(1);
  }
}

build();
