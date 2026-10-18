# pi-better-export

Pi's native HTML session export, with offline LaTeX rendering and a prompt to open the result in your browser.

The export keeps Pi's session tree, search, filters, code highlighting, and theme. It adds a Markdown math extension to the generated HTML rather than replacing Pi's viewer.

## Install

Requires Node.js 22.19+ and `@earendil-works/pi-coding-agent` 1.3+ (before 2.0). Tested against Pi 1.3.0. Earlier releases under the `@mariozechner` package name are not supported.

From GitHub:

```sh
pi install git:github.com/thgilciffart/pi-better-export
```

For local development:

```sh
npm install
pi -e ./index.ts
```

Once this package is published to npm, installation will also be available with `pi install npm:pi-better-export`.

## Use

```text
/better-export
/better-export report.html
/better-export "exports/My session.html"
/better-export --conversation conversation.html
/better-export --redact reviewed.html
/better-export --share --redact-text "Acme Internal" sharing.html
```

Paths are relative to the session's working directory. `~/` paths and missing parent directories are supported. Without a filename, the command generates a timestamped filename. Existing files require confirmation before replacement.

After saving, Pi asks whether to open the file in your default browser. Declining leaves the exported file in place. Exporting without a dialog-capable UI saves the file without opening a browser or overwriting an existing file.

Pi reserves `/export` in its terminal interface, so the enhanced command is `/better-export`. The built-in command remains available.

### Sharing and redaction

A plain `/better-export` keeps the full session tree and metadata, like Pi's default export. Sharing options are opt-in:

- `--conversation` exports only the active branch's user and assistant text and images. Tool calls, tool results, thinking, other branches, compaction summaries, system prompts, tool definitions, and local header paths are removed from the embedded payload. The native session tree and JSONL download contain only that conversation.
- `--redact` detects common API tokens, private keys, credential assignments, bearer headers, email addresses, home paths, and the current project path. It scans all exported string values, including prompts and nested tool output. Structural IDs and image bytes are preserved.
- `--redact-text "literal"` adds an exact text replacement and enables redaction. Repeat it for names, addresses, project identifiers, or other text you want removed.
- `--share` combines `--conversation` and `--redact`. It creates a local file; it does not upload anything.

Redaction opens a preview listing the proposed replacements. Select a finding to inspect the surrounding redacted text, choose **Save export with … redactions** to continue, or cancel. No destination file is changed until you accept the preview. Redaction requires a dialog-capable Pi UI.

Detection is heuristic and images are not scanned. Inspect the saved HTML before sharing it. Add exact text replacements for sensitive information the detector does not recognize.

### Print and PDF

Click **Print / PDF** in the export header, or use your browser's print command. Choose **Save as PDF** in the browser's print dialog to create a PDF.

Print styling uses a white background, dark text, wrapped code, page margins, and full output for visible tool results. It removes navigation, buttons, system-prompt/tool-definition panels, and copy notifications from the printed page. The displayed branch is printed; thinking and tool visibility follow the viewer's toggles. The screen layout retains Pi's styling.

### Math and copying

- Inline equations: `$x^2$` or `\(x^2\)`.
- Display equations: `$$...$$` or `\[...\]`, including multiline equations.
- Select and copy rendered math to get its raw LaTeX source, without delimiters. Selecting part of an equation copies the whole equation's source. Mixed selections retain surrounding prose.
- Click a display equation, or focus it and press Enter or Space, to copy its raw LaTeX. A status message confirms success or reports clipboard failure.
- Code spans and fenced code blocks remain literal. Ordinary prices such as `$20 and $30` remain text. Use `\$` for literal dollar signs in ambiguous prose.
- KaTeX, its CSS, and its fonts are embedded. Math works offline in a single HTML file. This adds approximately 1 MB to an export.
- MathML remains available for assistive technology. KaTeX supports a subset of LaTeX; unsupported syntax stays visible instead of aborting the export.

Browser clipboard restrictions vary for local files. Click-to-copy uses the Clipboard API when available and a legacy copy fallback when it is unavailable. Manual selection and copying also works.

## Compatibility notes

Pi currently has no public HTML export hook. This extension calls Pi's installed native exporter through one internal adapter (`src/native-export.ts`) and installs math before the viewer initializes Markdown. An incompatible template produces an explicit error and leaves an existing destination file intact.

The native exporter receives the live session tree, current leaf, system prompt, and tool metadata. The extension then copies the resolved colors from Pi’s live UI theme into the native CSS variables, including terminal-derived colors and custom export backgrounds. The native layout rules stay intact. Extension-specific TUI tool renderers are not exposed through the extension API, so custom tool results use Pi's native fallback rendering. Built-in tools retain Pi's HTML rendering.

Conversation filtering and redaction modify only the generated export, never the original Pi session.

## Development and npm release

```sh
npm ci
npm run check
npm test
npm pack --dry-run
```

The npm package ships the TypeScript extension, browser math script, and documentation. Pi loads the TypeScript directly; no build step is required. Runtime dependencies are declared in `package.json`. Tests and local session HTML are excluded from the npm package.

The package is prepared for a public npm release but has not been published. When you choose to release, authenticate to npm, verify the package name is available, and run `npm publish`. The prepublish hook runs type checking and tests.

## License

MIT. Embedded KaTeX assets retain their upstream copyright and license notices.
