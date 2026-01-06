#!/usr/bin/env bun

/**
 * Usage:
 *   bun run commit              # Uses "@{username} {DD}/{MM}/{YY} x{count}" as message
 *   bun run commit "message"    # Uses provided message
 *
 * This will:
 *   1. Stage all changes (git add .)
 *   2. Commit with the provided or default message
 *   3. Push to origin main
 * 
 * If any step fails, all changes are rolled back.
 */

import gradient from 'gradient-string'
import { createSpinner } from 'nanospinner'
import { join } from 'path'

const PROJECT_ROOT = join(import.meta.dir, '..')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  brightCyan: '\x1b[96m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightRed: '\x1b[91m',
}

const c = colors

type RollbackAction = () => Promise<void>
const rollbackStack: RollbackAction[] = []

async function runCommand(
  cmd: string,
  args: string[] = [],
  options: { silent?: boolean } = {}
) {
  const proc = Bun.spawn([cmd, ...args], {
    cwd: PROJECT_ROOT,
    stdout: options.silent ? 'pipe' : 'inherit',
    stderr: options.silent ? 'pipe' : 'inherit',
  })

  const exitCode = await proc.exited
  if (exitCode !== 0) {
    throw new Error(`Command failed with exit code ${exitCode}`)
  }
}

async function runCommandWithOutput(
  cmd: string,
  args: string[] = []
): Promise<string> {
  const proc = Bun.spawn([cmd, ...args], {
    cwd: PROJECT_ROOT,
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const output = await new Response(proc.stdout).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    const error = await new Response(proc.stderr).text()
    throw new Error(`Command failed: ${error}`)
  }

  return output.trim()
}

function header(title: string) {
  const g = gradient(['#3b82f6', '#06b6d4'])
  console.log(g('╭────────────────────────╮'))
  console.log(g(`│     ${title}      │`))
  console.log(g('╰────────────────────────╯\n'))
}

async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  onErrorText?: string
): Promise<T> {
  const spinner = createSpinner(text).start()
  const start = Date.now()
  try {
    const res = await fn()
    const duration = Date.now() - start
    spinner.success({
      text: `${text} (${(duration / 1000).toFixed(2)}s)`,
    })
    return res
  } catch (err) {
    const duration = Date.now() - start
    spinner.error({
      text: `${onErrorText ?? text + ' failed'} (${(duration / 1000).toFixed(
        2
      )}s)`,
    })
    throw err
  }
}

async function getGitHubUsername(): Promise<string> {
  return await runCommandWithOutput('git', ['config', 'user.name'])
}

function formatDate(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

async function getCommitCount(): Promise<number> {
  try {
    const output = await runCommandWithOutput('git', [
      'rev-list',
      '--count',
      'HEAD',
    ])
    return parseInt(output, 10) + 1
  } catch {
    return 1
  }
}

async function hasChanges(): Promise<boolean> {
  const proc = Bun.spawn(['git', 'status', '--porcelain'], {
    cwd: PROJECT_ROOT,
    stdout: 'pipe',
  })

  const output = await new Response(proc.stdout).text()
  return output.trim().length > 0
}

async function rollbackAll() {
  if (rollbackStack.length === 0) return

  console.log(`\n${c.yellow}⟲ Rolling back changes...${c.reset}`)

  while (rollbackStack.length > 0) {
    const action = rollbackStack.pop()
    if (action) {
      try {
        await action()
      } catch (err) {
        console.log(`${c.red}  Rollback action failed${c.reset}`)
      }
    }
  }

  console.log(`${c.green}✓ Rollback complete${c.reset}`)
}

async function commit() {
  console.clear()

  header('winput commit')

  try {
    const changesExist = await hasChanges()

    if (!changesExist) {
      console.log(
        `${c.brightGreen}✨ No changes to commit - workspace is clean!${c.reset}\n`
      )
      process.exit(0)
    }

    const args = process.argv.slice(2)
    let message: string

    if (args.length > 0 && args[0]) {
      message = args.join(' ')
      console.log(
        `${c.brightMagenta}Message:${c.reset} ${c.cyan}${message}${c.reset}\n`
      )
    } else {
      const username = await getGitHubUsername()
      const date = formatDate()
      const commitCount = await getCommitCount()
      message = `@${username} ${date} x${commitCount}`
      console.log(
        `${c.brightMagenta}Auto-generated:${c.reset} ${c.cyan}${message}${c.reset}\n`
      )
    }

    await withSpinner('Staging changes', async () => {
      await runCommand('git', ['add', '.'], { silent: true })
    })

    rollbackStack.push(async () => {
      console.log(`${c.gray}  Unstaging changes...${c.reset}`)
      await runCommand('git', ['reset', 'HEAD'], { silent: true })
    })

    await withSpinner('Creating commit', async () => {
      await runCommand('git', ['commit', '-m', message], { silent: true })
    })

    rollbackStack.push(async () => {
      console.log(`${c.gray}  Undoing commit...${c.reset}`)
      await runCommand('git', ['reset', '--soft', 'HEAD~1'], { silent: true })
    })

    await withSpinner('Pushing to origin/main', async () => {
      await runCommand('git', ['push', '-u', 'origin', 'main'])
    })

    console.log(
      `\n${c.bright}${c.brightGreen}✨ All done! Your changes are live.${c.reset}\n`
    )
  } catch (error) {
    await rollbackAll()
    console.error(`\n${c.brightRed}❌ Commit failed - all changes rolled back${c.reset}`)
    process.exit(1)
  }
}

commit()
