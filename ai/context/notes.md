# Operational Notes

## CLI Implementation Structure

```
cli-implementation/           (git submodule → templatize-html repo)
├── index.js                  Entry point, initializes modules, calls cliStartup()
├── config.js                 App name, version, default outputMap
├── package.json              npm package config (linkedom, parse5)
└── src/
    ├── allmodules.js         Aggregates modules with initialize()
    │
    │   # Modules (with initialize, in allmodules)
    ├── debugmodule.js        Logging (debug, info, error)
    ├── mainprocessmodule.js  Main pipeline implementation (F2-F8)
    ├── pathmodule.js         Path utilities (derivePagename, resolveOutputPaths)
    ├── startup.js            Orchestrates startup via cliStartup()
    │
    │   # Utilities (no initialize, direct import)
    ├── cliargument.js        Parse process.argv (input.html, output-map.json)
    ├── fileutils.js          File I/O with hash-based change detection, metaData.json management
    ├── htmlslicer.js         Asset extraction: dissect(html) → {htmlOnly, script, style}
    ├── templatizer.js        (F5) Content extraction + mustache template generation
    │
    │   # html2pug (local copy, no initialize)
    └── html2pug/
        ├── index.js          html2pug(html, options) entry
        └── pugifier.js       Pugifier class
```

**Module pattern**: Exports `initialize(cfg)`, aggregated in `allmodules.js`, called at startup.

**Utility pattern**: No initialize, imported directly where needed.

**Migration approach**: Copy logic from `src/` (Deno PoC) adapting for Node.js + linkedom.

## fileutils API

All write functions use hash-based change detection (returns `true` if written, `false` if unchanged).

| Function | Description |
|----------|-------------|
| `readInputFile()` | Read HTML input file |
| `writeScript(content)` | Write script.js |
| `writeStyle(content)` | Write style.css |
| `writeHeadMustache(content)` | Write document-head.mustache |
| `writeBodyMustache(content)` | Write body.mustache |
| `writeStaticContent(content)` | Write static content JSON |
| `writeMappingsFile(fileName, content)` | Write to mappings dir (e.g., meta.json) |
| `writeDynamicContentFile(fileName, content)` | Write to dynamic content dir |

## html2pug Dependency

Custom fork: `github.com/JhonnyJason/html2pug` (stripped of unnecessary dependencies)

```
cli-implementation/src/html2pug/
├── index.js      html2pug(html, options) entry point
└── pugifier.js   Pugifier class - DOM tree → Pug conversion
```

**External dependency**: Uses `linkedom` (shared with rest of CLI)

**Adaptation**: Adapted pugifier.js to work with standard DOM API instead of parse5 AST:
- Uses `node.nodeValue` instead of `node.value` for text nodes
- Uses `node.attributes` (NamedNodeMap) instead of `node.attrs` (array)
- Uses `node.nodeType` for doctype detection

**Options**:
- `fragment: boolean` - Parse as fragment vs full document
- `tabs: boolean` - Use tabs (default: spaces)
- `spaces: number` - Indent width (default: 4)
- `commas: boolean` - Attribute separator style
- `doubleQuotes: boolean` - Quote style

**Gotcha**: Text content with `>` characters gets split into multiple text nodes by linkedom, causing html2pug to output separate `| ` lines. Avoid special characters in placeholder keys.

## F5: Templatizer Implementation (DONE)

**Input**: `htmlOnly` string from F4 (HTML with style/script extracted)

**API**: `templatize(htmlOnly)` → returns object with:
- `documentHead` - Pug head template with includes (string)
- `body` - Pug body with `{{{selector}}}` placeholders (string)
- `fullContent` - selector → pugString mapping (object)
- `meta` - selector → {pugKey, pugString, content} (object)
- `dynamicFiles` - map of id → meta for dynamic sections (object)

**Output files** (written by fileutils via mainprocessmodule):
| File | Purpose |
|------|---------|
| `document-head.mustache` | Pug head template with body includes |
| `body.mustache` | Pug body with `{{{selector}}}` placeholders |
| `full-content.json` | selector → pugString mapping |
| `meta.json` | selector → {pugKey, pugString, content} |
| `<id>.json` | Dynamic section content |
| `list-item:<id>.json` | Dynamic-list item templates |

**Key internal functions** (ported from PoC):
- `processNode()` - Main recursive entry
- `processStatic/Dynamic/DynamicList()` - Content handlers
- `processAttributes()` - aria-label, placeholder extraction
- `newSelector()`, `addIndexInfo()` - CSS selector building
- `toPug()`, `toPugFragment()` - HTML → Pug via html2pug

**Note**: Uses `globalThis.pagename` for include paths (set by pathmodule).

## Key Data Structures

### meta.json

Maps CSS selectors to keys with content:

```json
" > head > title": {
    "mustacheKey": "unuMKey0",
    "pugKey": "unuKey0",
    "pugString": "!{templated.unuKey0}",
    "content": "Page Title Here"
}
```

- `mustacheKey` is the placeholder in `.mustache` files: `{{{unuMKey0}}}`
- `pugKey` becomes the key in `content/<lang>/<pagename>.json`
- `pugString` is the Pug interpolation syntax (mustache renders to this)
- `content` is the actual text (used for content-based matching)

**Key flow**: `{{{mustacheKey}}}` → mustache renders → `pugString` → pug renders → `content`

**Why separate mustacheKey?** CSS selectors contain `>`, spaces, `:` which linkedom/html2pug misinterpret as text node boundaries, causing broken multiline output. Simple alphanumeric keys avoid this.

### Dynamic Section Files

Separated by marker ID:
- `unuID0.json` - Content for element with `id="unuID0"` and `dynamic` attribute
- `list-item:unuID2.json` - Template content for `dynamic-list` items

## Merge Strategy

When merging with existing content JSON:

1. **Always overwrite** - New content takes precedence
2. **Generate overwrite summary** with:
   - `changed`: entries where content differs
   - `removed`: entries no longer present
   - `added`: new entries
3. **Content-based key matching** - When selectors change but content stays same, preserve existing pugKey

## Dynamic Content Mapping Challenge

Example: "2 entries had been found"

Needs decomposition into:
- `"entry"` (singular)
- `"entries"` (plural)
- `"had been found"` (suffix)

**Requirements for mapping:**
- Separate file (e.g., `<pagename>.mapping.json`)
- Must persist through design changes
- May depend on actual content for matching
- Supports manual setup or AI-assisted generation

## Target Output Structure

For `npx templatize-html path/to/index.html`:

```
sources/
├── source/index/
│   ├── style.css
│   ├── script.js
│   └── indexbody.pug
└── page-heads/index/
    └── document-head.pug

content/<lang>/
├── index.json           # merged content
├── index.overwritten.json  # overwrite summary
└── index.mapping.json   # dynamic content mapping
```

## Clarified Decisions

- **Pagename derivation**: Filename without extension (e.g., `index.html` → `index`)
- **Dynamic content mapping format**: JSON (e.g., `index.mapping.json`)
- **Output-map.json**: Defines where each artifact goes (allows flexible target structures)
- **Hash caching**: Enables efficient reruns — user edits mappings, reruns CLI, only final merge executes
