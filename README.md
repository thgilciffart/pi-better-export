# pi-better-export

Export [Pi](https://pi.dev) sessions as HTML with offline LaTeX, current theme colors, redaction, and print support. Exports retain Pi's session tree, search, filters, and code highlighting.

## Install

Requires Node.js 22.19 or later and Pi 1.3 or later, before 2.0.

```sh
pi install npm:pi-better-export
```

Run `/reload` in an open Pi session.

## Export a session

```text
/better-export
/better-export "exports/My session.html"
/better-export --share --redact-text "Acme Internal" sharing.html
```

Without a filename, the command creates a timestamped HTML file. Relative paths use the session's working directory. Home paths beginning with `~/` and missing parent directories are supported.

Pi asks before replacing a file and offers to open the result in your browser. Without a dialog-capable UI, it saves new files without opening them and refuses overwrites. The command requires a session file; in-memory sessions cannot be exported.

## Share an export

A default export includes the full session tree and metadata. These flags limit or redact the exported data:

| Flag | Effect |
| --- | --- |
| `--conversation` | Keeps the active branch's user and assistant text and images. Removes tools, thinking, other branches, summaries, system prompts, tool definitions, and local header paths. |
| `--redact` | Replaces detected API tokens, private keys, credentials, bearer headers, email addresses, home paths, and the current project path. |
| `--redact-text "literal"` | Adds an exact text replacement and enables redaction. Repeat for additional text. |
| `--share` | Combines `--conversation` and `--redact`. Creates a local file without uploading it. |

Redaction requires a dialog-capable UI. Review the proposed replacements and accept the preview to save. Detection is heuristic and does not scan images. Inspect the HTML before sharing it.

Filtering and redaction change the export only. The original session remains intact.

## Copy math and print

Inline math supports `$x^2$` and `\(x^2\)`. Display math supports `$$...$$` and `\[...\]`. Code stays literal. Use `\$` for a literal dollar sign in ambiguous prose.

Select rendered math to copy its LaTeX source without delimiters. Click a display equation, or focus it and press Enter or Space, to copy it. Clipboard support depends on your browser's restrictions for local files.

KaTeX, CSS, and fonts are embedded for offline use. Unsupported LaTeX stays visible.

Click **Print / PDF** or use your browser's print command, then choose **Save as PDF**. Printing uses the displayed branch and current thinking and tool visibility settings. Code wraps, and navigation and controls are hidden.

## Compatibility

The extension uses Pi's internal HTML exporter and was tested against Pi 1.3.0. An incompatible template produces an error without replacing an existing destination. Custom extension tools use Pi's fallback HTML rendering.

## Develop

```sh
npm ci
npm run check
npm test
pi -e ./index.ts
```

[MIT license](LICENSE). Embedded KaTeX assets retain their upstream license notices.
