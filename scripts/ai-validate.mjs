import { spawn } from 'node:child_process';
import { constants as osConstants } from 'node:os';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const logDirectory = join(projectRoot, '.logs');
const maxDiagnosticLines = 120;
const maxDiagnosticCharacters = 16_000;
const checks = {
  test: {
    executable: 'node_modules/vitest/vitest.mjs',
    args: ['run', '--reporter=dot', '--silent=passed-only', '--no-color'],
  },
  lint: {
    executable: 'node_modules/eslint/bin/eslint.js',
    args: ['.', '--max-warnings', '0', '--no-color'],
  },
  typecheck: {
    executable: 'node_modules/typescript/bin/tsc',
    args: ['--noEmit', '--pretty', 'false'],
  },
  build: {
    executable: 'node_modules/vite/bin/vite.js',
    args: ['build', '--clearScreen', 'false'],
  },
};

const [mode = 'validate', separator, ...forwardedArgs] = process.argv.slice(2);
if (separator !== undefined && separator !== '--') failUsage();
if (mode === 'validate' && forwardedArgs.length > 0)
  failUsage('Extra arguments can only be passed to a single check.');
const selectedChecks = mode === 'validate' ? Object.keys(checks) : [mode];
if (selectedChecks.some((name) => !(name in checks)))
  failUsage(`Unknown validation mode: ${mode}`);
await mkdir(logDirectory, { recursive: true });

for (const name of selectedChecks) {
  const result = await runCheck(name, checks[name], forwardedArgs);
  if (result.error) {
    console.error(`FAIL ${name}: could not start (${result.error.message})`);
    console.error(`Full log: ${relativeLogPath(result.logPath)}`);
    process.exitCode = 1;
    break;
  }
  if (result.code === 0) {
    console.log(`PASS ${name} (${formatDuration(result.durationMs)})`);
    continue;
  }
  const reason = result.signal
    ? `terminated by signal ${result.signal}`
    : `exited with code ${result.code}`;
  console.error(
    `FAIL ${name}: ${reason} (${formatDuration(result.durationMs)})`,
  );
  console.error(`Full log: ${relativeLogPath(result.logPath)}`);
  printDiagnostics(result.output);
  process.exitCode = result.signal
    ? signalExitCode(result.signal)
    : (result.code ?? 1);
  break;
}

function runCheck(name, command, extraArgs) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const outputChunks = [];
    const executable = join(projectRoot, command.executable);
    const child = spawn(
      process.execPath,
      [executable, ...command.args, ...extraArgs],
      {
        cwd: projectRoot,
        env: { ...process.env, CI: 'true', FORCE_COLOR: '0', NO_COLOR: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      },
    );
    child.stdout.on('data', (chunk) => outputChunks.push(chunk));
    child.stderr.on('data', (chunk) => outputChunks.push(chunk));
    child.once('error', async (error) => {
      const output = `${Buffer.concat(outputChunks).toString('utf8')}\nSpawn error: ${error.stack ?? error.message}\n`;
      resolve({
        error,
        output,
        logPath: await saveLog(name, output),
        durationMs: Date.now() - startedAt,
      });
    });
    child.once('close', async (code, signal) => {
      const output = Buffer.concat(outputChunks).toString('utf8');
      resolve({
        code,
        signal,
        output,
        logPath: await saveLog(name, output),
        durationMs: Date.now() - startedAt,
      });
    });
  });
}

async function saveLog(name, output) {
  const logPath = join(logDirectory, `${name}.log`);
  const header = [
    `check: ${name}`,
    `time: ${new Date().toISOString()}`,
    `node: ${process.version}`,
    '',
  ].join('\n');
  await writeFile(logPath, header + output, 'utf8');
  return logPath;
}

function printDiagnostics(output) {
  const ansiPattern = new RegExp(
    String.fromCharCode(27) + String.raw`\[[0-?]*[ -/]*[@-~]`,
    'g',
  );
  const normalized = output.replace(ansiPattern, '').trim();
  if (!normalized) {
    console.error('No diagnostic output was produced.');
    return;
  }
  let diagnostic = normalized
    .split(/\r?\n/)
    .slice(-maxDiagnosticLines)
    .join('\n');
  if (diagnostic.length > maxDiagnosticCharacters)
    diagnostic = diagnostic.slice(-maxDiagnosticCharacters);
  console.error(
    diagnostic.length < normalized.length
      ? '--- diagnostics (tail, truncated) ---'
      : '--- diagnostics ---',
  );
  console.error(diagnostic);
}

function signalExitCode(signal) {
  return 128 + (osConstants.signals[signal] ?? 1);
}
function relativeLogPath(logPath) {
  return logPath.slice(projectRoot.length + 1).replaceAll('\\', '/');
}
function formatDuration(milliseconds) {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}
function failUsage(message) {
  if (message) console.error(message);
  console.error(
    'Usage: node scripts/ai-validate.mjs <validate|test|lint|typecheck|build> [-- extra args]',
  );
  process.exit(2);
}
