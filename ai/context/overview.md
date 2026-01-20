# Project Overview

This project provides a CLI tool to decompose static HTML (from designers) into templatized artifacts for a Pug-based frontend build system.

## Purpose

Take a statically rendered HTML page and decompose it into:
- Pug templates (document-head, body)
- Extracted assets (style.css, script.js)
- Content JSON (for i18n and dynamic rendering)

Enable client-side rendering of dynamic content via API interactions.

## Target Environment

```
project/
├── package.json              # "lang" property defines default language
├── sources/
│   ├── source/<pagename>/
│   │   ├── style.css
│   │   ├── script.js
│   │   └── <pagename>body.pug
│   └── page-heads/<pagename>/
│       └── document-head.pug
├── content/
│   └── <lang>/
│       └── <pagename>.json
```

**Template hierarchy:**
- `document-head.pug` (top-level) includes:
  - `styles-include.pug`
  - `scripts-include.pug`
  - `<pagename>body.pug`

## Workflow

| Step | Action | Output |
|------|--------|--------|
| 1 | `npx templatize-html <path>/index.html` | Decomposed files to target structure |
| 2 | Merge extracted content with existing `content/<lang>/<pagename>.json` | Updated content + overwrite summary |
| 3 | Dynamic content mapping (manual/AI assisted) | Persistent mapping file |
| 4 | Implement API + client-side rendering | Working dynamic content |

## Technology Stack

- **Runtime**: Node.js (CLI tool and target projects)
- **Templating**: Pug, Mustache (intermediate)
- **HTML Parsing**: linkedom (DOM manipulation and html2pug conversion)
- **HTML→Pug**: Custom html2pug fork (local copy from JhonnyJason/html2pug)

## Current State

**CLI Implementation** (`cli-implementation/` - git submodule):
- Node.js CLI tool: `templatize-html`
- Module structure initialized
- F4 (Asset Extraction) implemented via `htmlslicer.js`
- **Next: F5 (Content & Templates)** - Migration from PoC `templatizor.js`

**Proof-of-concept** (`src/` - Deno, reference only):
- `deno task dissect-html` - Extract style/script from HTML
- `deno task templatize-stripped` - Generate templates + content JSON
- `deno task render-normalized` - Placeholder rendering for pattern detection

## Key Concepts

### Dynamic Content Markers

In source HTML, designers use attributes:
- `dynamic` - Element contains dynamic content (separate template)
- `dynamic-list` - Element is a list container (template for list items)

### Key Translation Layer

```
CSS Selector → pugKey → pugString → content
                 ↓
         (key in content/<lang>/<pagename>.json)
```

### Content Categories

1. **Static content** - Labels, UI text, fixed strings
2. **Dynamic content** - API-driven, rendered client-side
3. **Pluralized/composed content** - Requires mapping (e.g., "2 entries found")

## File Reference

**CLI Implementation** (`cli-implementation/`):
- `index.js` - Entry point, module initialization
- `config.js` - App configuration (name, version, default outputMap)
- `src/allmodules.js` - Module aggregator (modules with initialize)

*Modules* (with initialize):
- `src/debugmodule.js` - Debug/logging utilities
- `src/mainprocessmodule.js` - Main pipeline (F2-F8)
- `src/pathmodule.js` - Path resolution utilities
- `src/startup.js` - Startup orchestration

*Utilities* (no initialize, direct import):
- `src/cliargument.js` - CLI argument parsing
- `src/fileutils.js` - File I/O with hash-based change detection, metaData.json management
- `src/htmlslicer.js` - Asset extraction utility (F4)

**Proof-of-concept** (`src/` - Deno):
- `dissect-html.js` - HTML → stripped.html + style.css + script.js
- `templatizor.js` - stripped.html → templates + content JSON
- `render-normalized.js` - Placeholder rendering
- `htmlTags.js` - HTML5 tag categorization

## Pipeline Flow

```
input.html ──┬──► F1-F3: Parse input, resolve output paths
             │
             ├──► F4: Extract assets (style.css, script.js)
             │
             ├──► F5: Generate content maps + mustache templates
             │
             └──► F6: Check dynamic content mappings
                      │
                      ├─► intervention required ──► STOP (notify user)
                      │
                      └─► no intervention ──► F7: Merge + generate Pug
                                              │
                                              └─► F8: Save hashes for rerun
```
