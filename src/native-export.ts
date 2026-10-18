import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getPackageDir, type ExtensionContext, type ExtensionAPI } from '@earendil-works/pi-coding-agent';

// Pi does not expose an HTML-export hook or export this helper from its public API.
// Keep the single internal dependency here so template/API changes are easy to adapt.
export async function nativeExport(pi: ExtensionAPI, ctx: ExtensionContext, outputPath: string): Promise<void> {
  const moduleUrl = pathToFileURL(join(getPackageDir(), 'dist/core/export-html/index.js')).href;
  const { exportSessionToHtml } = await import(moduleUrl);
  await exportSessionToHtml(ctx.sessionManager, {
    systemPrompt: ctx.getSystemPrompt(),
    tools: pi.getAllTools(),
  }, { outputPath, themeName: ctx.ui.theme.name });
}
