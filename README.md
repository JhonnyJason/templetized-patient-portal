# Templetizing Static HTML
The general goal here is to take a static HTML-page and turn it into a form where we may add dynamically rendered content.
The possibility for easy translation of the content.json is an additional benefit.

## The Process

### Create Stripped HTML (src/strip-html.js = deno run strip-html)
- There is an expected structure HTML[head[..., style ], body[..., script]]
- The Style.css and script.js may be easily cut out here -> notify if the expected structure is violated.

### Initial Templatization (src/templatize.js = deno run templatize)
- Run raw templetization -> template.mustache + content.json

### Find Repeating Patterns in Normalized Template (src/)
- Equalize Contents: Fill all content with same string "template-content". -> equalized.html
- Transform to Pug -> equalized.pug
- Extract repeating patterns -> reflect them as lists in content.json

### Mark Dynamic Content ( manually - how we know? )
- Create a curated content.json which includes information on each entry, if it is static or dynamic
- Separate content.json into: dynamic.json and static.json

### Rendering Logic for Dynamic Content ( mostly manually )
- implement API calls + rendering of dynamic content: -> dynamic-render.js
- prepend dynamic-render.js to script.js

### Render the Output HTML ( src/render-output.js = deno run render-output )


## TODOs
- [x] serve HTML -> inspection of input and output
- [x] Dissect original HTML to: stripped.html + style.css + script.js
- [x] Templatize stripped.html: dynamic-templates + dynamic.json + static-template + static.json
- [ ] build pipeline connected with the repository for the implementation -> content to language content repository, document-head to separated repository and indexbody to separate repository

## Scripts/Testing

### HTML introspection
- serve the original-html: deno run introspect-original 
- serve the output-html: deno run introspect-output

### Dissecting and Templetizing
- dissect HTML: deno run dissect-html

---

# License
[CC0](https://creativecommons.org/publicdomain/zero/1.0/)
