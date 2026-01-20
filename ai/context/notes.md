# Operational Notes

## CLI Implementation Structure

```
cli-implementation/           (git submodule → templatize-html repo)
├── index.js                  Entry point, initializes modules, calls cliStartup()
├── config.js                 App name, version, default outputMap
├── package.json              npm package config, linkedom dependency
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
    └── htmlslicer.js         Asset extraction: dissect(html) → {htmlOnly, script, style}
```

**Module pattern**: Exports `initialize(cfg)`, aggregated in `allmodules.js`, called at startup.

**Utility pattern**: No initialize, imported directly where needed.

**Migration approach**: Copy logic from `src/` (Deno PoC) adapting for Node.js + linkedom.

## Key Data Structures

### meta.json

Maps CSS selectors to pug keys with content:

```json
" > head > title": {
    "pugKey": "unuKey0",
    "pugString": "!{templated.unuKey0}",
    "content": "Page Title Here"
}
```

- `pugKey` becomes the key in `content/<lang>/<pagename>.json`
- `pugString` is the Pug interpolation syntax
- `content` is the actual text (used for content-based matching)

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
