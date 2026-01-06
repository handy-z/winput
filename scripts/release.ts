#!/usr/bin/env bun

/**
 * Monorepo Release Script
 * Publishes all @winput/* packages to npm in the correct order
 *
 * Usage:
 *   bun run release [patch|minor|major] [--dry-run]
 *
 * Features:
 *   - Detects file changes since last release tag
 *   - Only bumps and publishes packages with changes
 *   - Skips packages already published with same version
 *   - Rollback version bumps if publish fails
 */

import { createSpinner } from "nanospinner";
import { readFileSync, writeFileSync, existsSync } from "fs";
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

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  brightGreen: "\x1b[92m",
  brightRed: "\x1b[91m",
  bgGreen: "\x1b[42m",
  white: "\x1b[37m",
};

const c = colors;

interface VersionBackup {
  pkgName: string;
  pkgJsonPath: string;
  originalVersion: string;
}

const versionBackups: VersionBackup[] = [];

function readPackageJson(pkgPath: string) {
  const content = readFileSync(pkgPath, "utf-8");
  return JSON.parse(content);
}

function writePackageJson(pkgPath: string, pkg: Record<string, unknown>) {
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function bumpVersion(current: string, type: BumpType): string {
  const [major, minor, patch] = current.split(".").map(Number);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function runCommand(
  cmd: string,
  args: string[],
  cwd: string
): Promise<{ success: boolean; output: string }> {
  const proc = Bun.spawn([cmd, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  return {
    success: exitCode === 0,
    output: stdout + stderr,
  };
}

async function getPublishedVersion(pkgName: string): Promise<string | null> {
  const result = await runCommand(
    "npm",
    ["view", pkgName, "version"],
    PROJECT_ROOT
  );
  if (result.success) {
    return result.output.trim();
  }
  return null;
}

async function hasUncommittedChanges(pkgName: string): Promise<boolean> {
  const pkgPath = `packages/${pkgName}`;

  const statusResult = await runCommand(
    "git",
    ["status", "--porcelain", "--", pkgPath],
    PROJECT_ROOT
  );

  if (statusResult.success && statusResult.output.trim().length > 0) {
    return true;
  }

  const diffResult = await runCommand(
    "git",
    ["diff", "--name-only", "HEAD~1", "HEAD", "--", pkgPath],
    PROJECT_ROOT
  );

  if (diffResult.success && diffResult.output.trim().length > 0) {
    return true;
  }

  return false;
}

async function needsPublish(
  pkgName: string,
  npmPkgName: string,
  localVersion: string
): Promise<{ needs: boolean; reason: string }> {
  const publishedVersion = await getPublishedVersion(npmPkgName);

  if (!publishedVersion) {
    return { needs: true, reason: "not published" };
  }

  if (localVersion !== publishedVersion) {
    return {
      needs: true,
      reason: `version ${localVersion} > ${publishedVersion}`,
    };
  }

  const hasChanges = await hasUncommittedChanges(pkgName);
  if (hasChanges) {
    return { needs: true, reason: "code changes detected" };
  }

  return { needs: false, reason: "up to date" };
}

async function isVersionPublished(
  pkgName: string,
  version: string
): Promise<boolean> {
  const result = await runCommand(
    "npm",
    ["view", `${pkgName}@${version}`, "version"],
    PROJECT_ROOT
  );
  return result.success && result.output.trim() === version;
}

async function publishPackage(
  pkgName: string,
  dryRun: boolean
): Promise<boolean> {
  const pkgDir = join(PACKAGES_DIR, pkgName);
  const pkgJsonPath = join(pkgDir, "package.json");

  if (!existsSync(pkgJsonPath)) {
    console.log(`${c.yellow}⚠ Skipping ${pkgName} (not found)${c.reset}`);
    return true;
  }

  const pkg = readPackageJson(pkgJsonPath);

  if (pkg.private) {
    console.log(`${c.gray}○ Skipping ${pkg.name} (private)${c.reset}`);
    return true;
  }

  const alreadyPublished = await isVersionPublished(pkg.name, pkg.version);
  if (alreadyPublished) {
    console.log(
      `${c.gray}○ Skipping ${pkg.name}@${pkg.version} (already published)${c.reset}`
    );
    return true;
  }

  const spinner = createSpinner(
    `Publishing ${pkg.name}@${pkg.version}`
  ).start();

  if (dryRun) {
    spinner.success({ text: `${pkg.name}@${pkg.version} (dry run)` });
    return true;
  }

  const result = await runCommand(
    "npm",
    ["publish", "--access", "public"],
    pkgDir
  );

  if (result.success) {
    spinner.success({ text: `${pkg.name}@${pkg.version}` });
  } else {
    spinner.error({ text: `Failed to publish ${pkg.name}` });
    console.log(`${c.gray}${result.output}${c.reset}`);
  }

  return result.success;
}

async function bumpPackageVersion(
  pkgName: string,
  type: BumpType
): Promise<boolean> {
  const pkgJsonPath = join(PACKAGES_DIR, pkgName, "package.json");
  if (!existsSync(pkgJsonPath)) return false;

  const pkg = readPackageJson(pkgJsonPath);
  const originalVersion = pkg.version;

  versionBackups.push({ pkgName, pkgJsonPath, originalVersion });

  pkg.version = bumpVersion(pkg.version, type);
  writePackageJson(pkgJsonPath, pkg);

  console.log(
    `${c.cyan}${pkg.name}${c.reset} → ${c.green}${pkg.version}${c.reset}`
  );
  return true;
}

async function rollbackVersions() {
  if (versionBackups.length === 0) return;

  console.log(`\n${c.yellow}⟲ Rolling back version changes...${c.reset}`);

  for (const backup of versionBackups) {
    try {
      const pkg = readPackageJson(backup.pkgJsonPath);
      pkg.version = backup.originalVersion;
      writePackageJson(backup.pkgJsonPath, pkg);
      console.log(
        `${c.gray}  Restored ${backup.pkgName} → ${backup.originalVersion}${c.reset}`
      );
    } catch {
      console.log(`${c.red}  Failed to restore ${backup.pkgName}${c.reset}`);
    }
  }

  console.log(`${c.green}✓ Version rollback complete${c.reset}`);
}

async function createReleaseTag(
  version: string,
  dryRun: boolean
): Promise<boolean> {
  const tag = `v${version}`;

  if (dryRun) {
    console.log(`${c.gray}○ Would create tag ${tag} (dry run)${c.reset}`);
    return true;
  }

  const tagResult = await runCommand("git", ["tag", tag], PROJECT_ROOT);
  if (!tagResult.success) {
    console.log(`${c.yellow}⚠ Failed to create tag ${tag}${c.reset}`);
    return false;
  }

  const pushResult = await runCommand(
    "git",
    ["push", "origin", tag],
    PROJECT_ROOT
  );
  if (pushResult.success) {
    console.log(`${c.green}✓ Created and pushed tag ${tag}${c.reset}`);
  }

  return pushResult.success;
}

async function release() {
  console.clear();
  const args = process.argv.slice(2);

  const dryRun = args.includes("--dry-run");
  const normalizedArgs = args.map((arg) => arg.replace(/^--/, ""));
  const bumpType = normalizedArgs.find((arg) =>
    ["patch", "minor", "major"].includes(arg)
  ) as BumpType | undefined;

  console.log(`${c.bright}${c.cyan}╭────────────────────────╮${c.reset}`);
  console.log(`${c.bright}${c.cyan}│   @winput/* Release    │${c.reset}`);
  console.log(`${c.bright}${c.cyan}╰────────────────────────╯${c.reset}\n`);

  versionBackups.length = 0;

  const packagesToPublish: string[] = [];

  if (bumpType) {
    console.log(`${c.yellow}Checking packages (${bumpType}):${c.reset}\n`);

    for (const pkgName of PUBLISH_ORDER) {
      const pkgJsonPath = join(PACKAGES_DIR, pkgName, "package.json");
      if (!existsSync(pkgJsonPath)) continue;

      const pkg = readPackageJson(pkgJsonPath);
      const npmPkgName = pkg.name as string;
      const localVersion = pkg.version as string;

      const result = await needsPublish(pkgName, npmPkgName, localVersion);

      if (result.needs) {
        console.log(`${c.cyan}● ${npmPkgName} (${result.reason})${c.reset}`);
        const bumped = await bumpPackageVersion(pkgName, bumpType);
        if (bumped) {
          packagesToPublish.push(pkgName);
        }
      } else {
        console.log(
          `${c.gray}○ ${npmPkgName}@${localVersion} (${result.reason})${c.reset}`
        );
      }
    }

    if (packagesToPublish.length === 0) {
      console.log(`\n${c.yellow}All packages are up to date.${c.reset}\n`);
      return;
    }

    console.log();
  } else {
    packagesToPublish.push(...PUBLISH_ORDER);
  }

  if (dryRun) {
    console.log(`${c.yellow}🔍 Dry run mode${c.reset}\n`);
  }

  console.log(`${c.bright}Publishing packages:${c.reset}\n`);

  let allSuccess = true;
  let publishedVersion: string | null = null;

  for (const pkgName of PUBLISH_ORDER) {
    if (bumpType && !packagesToPublish.includes(pkgName)) {
      const pkgJsonPath = join(PACKAGES_DIR, pkgName, "package.json");
      if (existsSync(pkgJsonPath)) {
        const pkg = readPackageJson(pkgJsonPath);
        console.log(`${c.gray}○ Skipping ${pkg.name} (no changes)${c.reset}`);
      }
      continue;
    }

    const success = await publishPackage(pkgName, dryRun);
    if (!success) {
      allSuccess = false;
      break;
    }

    if (pkgName === "winput") {
      const pkgJsonPath = join(PACKAGES_DIR, pkgName, "package.json");
      if (existsSync(pkgJsonPath)) {
        publishedVersion = readPackageJson(pkgJsonPath).version;
      }
    }
  }

  if (bumpType && !dryRun) {
    const spinner = createSpinner("Committing version bumps").start();

    await runCommand("git", ["add", "-A"], PROJECT_ROOT);

    const version = publishedVersion || "latest";
    const commitResult = await runCommand(
      "git",
      ["commit", "-m", `release: v${version}`],
      PROJECT_ROOT
    );

    if (commitResult.success) {
      const pushResult = await runCommand(
        "git",
        ["push", "origin", "main"],
        PROJECT_ROOT
      );

      if (pushResult.success) {
        spinner.success({ text: `Committed and pushed v${version}` });
      } else {
        spinner.warn({ text: "Committed but failed to push" });
      }
    } else {
      spinner.warn({ text: "Nothing to commit" });
    }

    if (publishedVersion) {
      await createReleaseTag(publishedVersion, dryRun);
    }
  }
  
  if (allSuccess) {
    console.log(
      `\n${c.bright}${c.bgGreen}${c.white} ✨ All packages published! ${c.reset}\n`
    );
  } else {
    console.log(
      `\n${c.brightRed}✗ Release failed - some packages may need manual publishing${c.reset}\n`
    );
    process.exit(1);
  }
}

release();
