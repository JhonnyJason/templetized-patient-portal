
//##############################################################################
// HTML5 Tags which are not relevant for inline-texts
// They still could be inline and next to texts...
export const regularTags = new Set([
    "address", // Address - replaces <P> for contact information
    "area", // Defines an area inside an image map -> clickable areas
    "article", // Independent self-contained Content
    "aside", // Content only indirectly related to main content
    "audio", // Use audisource and provide controls
    "base", // Specify default URL and a default target for all links on the page
    "blockquote", // Block Element for a Quote with citation-link - replaces <P>
    "body", // HTML Body
    "button", // button element <button value="activation">Activate!</button>
    "canvas", // Canvas - element for drawing graphics
    "caption", // table Caption
    "col", // Column element in Colgroup - table
    "colgroup", // Group of col elements - table
    "datalist", // Datalist for Input elements - contains options
    "dd", // Description Data element within Description list <dl>
    "details", // Interactive Element to toggle visibility of "detailed" info
    "dialog",  // Interactive Element detached from regular element
    "div", // Standard division Element
    "dl", // Description List
    "dt", // Description Term the "Term that is being described"
    "embed", // general Embed element of "plug-in" applications - deprecated?
    "fieldset", // For Grouping related Elemente in a Form
    "figcaption", // Caption element inside a "figure" element
    "figure", // Figure -> combine external visual illustrations with a caption
    "footer", // Semantic Footer Element
    "form", // Container of Forms
    "h1", // Heading level 1
    "h2", // Heading level 2
    "h3", // Heading level 3
    "h4", // Heading level 4
    "h5", // Heading level 5
    "h6", // Heading level 6
    "head", // Document Head Element
    "header", // Container for Introductory Content
    "hgroup", // Grouping <hX> and <p> element together
    "hr", // Semantic break between block elements
    "label", // Label for elements in a Form
    "legend", // Defines a Caption for a FieldSet Element
    "li", // List Element
    "link", // defines relationship between current document and an external resource - head
    "main", // Element for main Content - next to header and footer
    "map", // Map Element for overlaying clickable areas onto an image 
    "menu", // Defines an unordered List for menu items <li>    
    "meter", // Gauge display of scalar value within a range
    "nav", // Block of navigationally relevant elements
    "noscript", // Alternative Content in case of missing javascript capabilities
    "object", // Similar to embed -> alternatives (imng, video, audio, iframe)- deprecated? 
    "ol", // Ordered List of <li> - automatically adds the Number in list-style
    "optgroup", // Option groups - group large lists of options
    "option", // Option Element for select, optgroup and datalist
    "p", // Paragraph Block
    "param", // used to define parameters of an "object" element - deprecated?
    "picture", // wrapper for source and img elements for added flexibility
    "progress", // progress gauge displaying current scalar level in the range 0 to max
    "script", // Script Tag
    "search", // Block around search-relevant elements
    "section", // Sections of Documents -> may have their own h1
    "select", // Select Element = Dropbox -> contains the option elements
    "source", // source element for audio, video, img etc.
    "style", // Style Element for the CSS - head
    "summary", // Summary which is always visible in the interactive details element
    "svg", // SVG Element
    "table", // Table Element
    "tbody", // Body of a Table element
    "td", // Table Data element  -> cell of a table
    "template", // Template Element - not being displayed -> for JS use 
    "tfoot", // Table footer Element
    "th", // Table heading Element - cell inside header
    "thead", // Table Header Element 
    "title", // Title Element in HTML Head
    "tr", // Table row Element - contains the td or th elements 
    "track", // Specify a text track for a video or audio Element ? Category ?
    "ul", // unordered List - no natural enumeration of li elements
    "video", // Video element
])

//##############################################################################
// Tags for inline text which adds meta information 
// maybe we want to edit the meta information as well
export const textMetaTags = new Set([
    "a", // Anchor (hyperlink) <a href="link">inner text</a>
    "abbr", // Abbreviation <abbr title="World Health Organization">WHO</abbr>
    "bdo", // bi-directional override <bdo dir="rtl">right-to-left</bdo>
    "data", // associate data with text <data value="21053">Cherry Tomato</data>
    "dfn", // Definition element <dfn title="HyperText Markup Language">HTML</dfn>
    "iframe", // <iframe src="link" title="This might be interesting text"></iframe>
    "img", // <img src="source" alt="THis might be interesting text">
    "input", // <input type="text" placeholder="This might be interesting text">
    "meta", // <meta name="description" content="This might be interesting text">
    "output", // dynamic element for calculation results ?  categorization ?
    "textarea", // <textarea placeholder="This might be interesting text"></textarea>
])

//##############################################################################
// Tags for inline text which merely adds style information 
export const textStyleTags = new Set([
    "b", // Bring attention
    "bdi", // bi-directional isolation, e.g for arabic names 
    "br", // line-break
    "cite", // inline-citation -> link of quote often accompanied with q for the quote 
    "code", // Code styled inline text
    "del", // "Deleted" element usually line-through text 
    "em", // Emphasized text
    "i", // Idiomatic text - Alternative Mood for this inline text section
    "ins", // inserted part of text
    "kbd", // mark as keyboard input
    "mark", // Generally marked/highlighted text
    "pre", // preformatted text - text is displayed exactly as in the html -> preserving whitespaces nd line-breaks
    "q", // short inline-quotation often accompanied with cite 
    "rp", // Ruby Annotation?
    "rt", // Ruby Annotation?
    "ruby", // Ruby Annotation?
    "s", // Strikethrough text - e.g. deprecated information: similar to "del"
    "samp", // Sample output from a program
    "small", // Small print e.g. copyright claims
    "span", // distinguish parts of a text - e.g. with different style
    "strong", // Important text
    "sub", // subscript - e.g. smaller and below the baseline
    "sup", // superscript - e.g. smaller and above the baseline
    "time", // text representing time
    "u", // Unarticulated annotation, or "unique" text
    "var", // mark variables of math or programming contexts
    "wbrd", // signals word break opportunity 
])