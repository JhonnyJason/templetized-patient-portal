# Features for v0.1.0

## Checklist

- [ ] **F1: Basic CLI** — `decompose-static <input.html> [output-map.json]`
- [ ] **F2: Input Parsing** — Read input file, derive pagename from filename (without extension)
- [ ] **F3: Output Mapping** — Read output-map file, construct target paths (default map as fallback)
- [ ] **F4: Asset Extraction** — Separate and write `script.js`, `style.css`
- [ ] **F5: Content & Templates** — Write `full-content.json`, `unuID*.json`, `meta.json`, `body.mustache`, `document-head.mustache`
- [ ] **F6: Dynamic Content Check** — Read content mappings, check if user intervention required (default: stop and notify)
- [ ] **F7: Auto-Merge Path** — If no intervention needed: merge content with language file, generate `<pagename>body.pug` and `document-head.pug`
- [ ] **F8: Hash-Based Caching** — Save file hashes; skip reprocessing unchanged inputs (enables rerun after user creates mappings)
