# Features for v0.1.0

## Checklist

- [x] **F1: Basic CLI** — `templatize-html <input.html> [output-map.json]`
- [x] **F2: Input Parsing** — Read input file, derive pagename from filename (without extension)
- [x] **F3: Output Mapping** — Read output-map file, construct target paths (default map as fallback)
- [x] **F4: Asset Extraction** — Separate and write `script.js`, `style.css` and write them out.
- [ ] **F5: Content & Templates** — Parse `htmlOnly` to get and write `static.json`, `unuID*.json`, `body.mustache`, `head.mustache` and `naive-mapping.json`
- [ ] **F6: Dynamic Content Check** — Read content mappings, check if user intervention required (default: stop and notify)
- [ ] **F7: Auto-Merge Path** — If no intervention needed: merge content with language file, generate `<pagename>body.pug` and `document-head.pug`
- [ ] **F8: Hash-Based Caching** — Save file hashes; skip reprocessing unchanged inputs (enables rerun after user creates mappings)
