import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import open from 'open';
import type { ExtensionAPI, ExtensionCommandContext } from '@earendil-works/pi-coding-agent';
import { enhanceHtml } from './src/enhance.ts';
import { nativeExport } from './src/native-export.ts';

export async function exportCommand(pi: ExtensionAPI, args: string, ctx: ExtensionCommandContext): Promise<void> {
  let staging: string | undefined;
  try {
    await ctx.waitForIdle();
    if (!ctx.sessionManager.getSessionFile()) throw new Error('Nothing to export yet. Start a conversation first.');
    let filename = args.trim();
    if ((filename.startsWith('"') && filename.endsWith('"')) || (filename.startsWith("'") && filename.endsWith("'"))) filename = filename.slice(1, -1);
    filename ||= `pi-session-${new Date().toISOString().replace(/[:.]/g, '-')}.html`;
    if (!/\.html?$/i.test(filename)) throw new Error('Choose an .html or .htm file. Usage: /better-export [file.html]');
    if (filename.startsWith('~/')) filename = join(homedir(), filename.slice(2));
    const target = resolve(ctx.cwd, filename);
    try {
      await access(target);
      if (!ctx.hasUI) throw new Error(`File already exists: ${target}`);
      if (!await ctx.ui.confirm('Replace existing export?', target)) return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    await mkdir(dirname(target), { recursive: true });
    staging = await mkdtemp(join(dirname(target), '.pi-better-export-'));
    const temporary = join(staging, 'session.html');
    await nativeExport(pi, ctx, temporary);
    await writeFile(temporary, await enhanceHtml(await readFile(temporary, 'utf8')), 'utf8');
    await rename(temporary, target);
    ctx.ui.notify(`Exported to ${target}`, 'info');
    if (ctx.hasUI && await ctx.ui.confirm('Open exported HTML?', 'Open this export in your default browser?')) {
      try {
        await open(pathToFileURL(target).href, { wait: false });
      } catch (error) {
        ctx.ui.notify(`Export saved, but the browser could not be opened: ${error instanceof Error ? error.message : String(error)}`, 'warning');
      }
    }
  } catch (error) {
    ctx.ui.notify(`Export failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
  } finally {
    if (staging) await rm(staging, { recursive: true, force: true });
  }
}

export default function betterExport(pi: ExtensionAPI): void {
  pi.registerCommand('better-export', {
    description: 'Export native Pi HTML with offline LaTeX and optional browser preview',
    handler: (args, ctx) => exportCommand(pi, args, ctx),
  });
}
