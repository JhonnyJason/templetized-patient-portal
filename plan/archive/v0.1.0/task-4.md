# Task 4
Implement F5: Content & Templates

## Details

F5 transforms the stripped HTML (from F4) into templatized artifacts.

### This is a Migration Task

The PoC (`src/templatizor.js`, ~460 lines) already implements all core logic. Our job is to **port it to the Node.js CLI** with appropriate adaptations, not to design from scratch.

### Input
- `htmlOnly` string from F4 (HTML with style/script extracted)

### Output (see `dissected/` for examples)
| File | Purpose |
|------|---------|
| `document-head.mustache` | Pug template with head + body includes - should be called `head.mustache`  |
| `body.mustache` | Pug body content with `{{{selector}}}` placeholders |
| `full-content.json` | selector → pugString (for rendering) - should be called `static.json` and will be stored at `staticContentPath`|
| `meta.json` | selector → {pugKey, pugString, content} (for later merging) - should be stored in the contentMappingsDir |
| `<id>.json` | Dynamic section content |
| `list-item:<id>.json` | Dynamic-list item templates |

### Adaptation Requirements

| PoC (Deno) | CLI (Node.js) |
|------------|---------------|
| `jsr:@b-fuze/deno-dom` | `linkedom` (already available) |
| Hardcoded paths | Config/pathmodule |
| Direct `fs.writeFileSync` | fileutils pattern |
| Standalone script | Module with `initialize()` + `execute()` |
| Raw GitHub html2pug | Local copy (see below) |

### html2pug Dependency
Custom code adapted to be used in this project -> uses linkedom for DOM parsing.

| File | Purpose |
|------|---------|
| `src/html2pug/index.js` | Entry point, `html2pug(html, options)` |
| `src/html2pug/pugifier.js` | Conversion logic (Pugifier class) |

Is usable - all tests run successfully.

### Key PoC Functions to Port
- `templatize()` - Main recursive entry
- `templatizeStatic/Dynamic/DynamicList()` - Content type handlers
- `templatizeAttributes()` - aria-label, placeholder extraction
- `newselector()`, `addIndexInfo()` - CSS selector building
- `addToContent()` - Content + meta map population
- `hasNoText()`, `isEmptyLeave()` - Helper predicates
- `toPug()`, `toPugFragment()` - HTML → Pug conversion
- `prepareAndWriteDocumentHead()` - Head template assembly

### Notes
- `htmlTags.js` is imported but never used in PoC - skip it
- Dynamic templates get appended to body as `<ctemplate id="...">` elements
- Attribute replacements are post-processed after Pug conversion

## Sub-Tasks

- [x] **S1: Add html2pug** - Copy `index.js` + `pugifier.js` into `src/html2pug/`, adapt import to Node.js, replace `parse5` dependency with `linkedom`
- [x] **S2: Create templatizer module** - `src/templatizer.js` with module structure, port PoC with linkedom adaptation
- [x] **S3: Adapt file output** - Use fileutils/config pattern instead of hardcoded paths
- [x] **S4: Integrate with mainprocessmodule** - Wire `templatize(htmlOnly)` into pipeline after F4
- [x] **S5: Test with sample input** - Verify output matches PoC structure